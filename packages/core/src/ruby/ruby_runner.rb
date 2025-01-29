require 'json'
require 'io/console'
require 'ostruct'
require 'pathname'
require_relative 'logger'
require_relative 'rpc'
require_relative 'rpc_state_manager'

def parse_args(arg)
  begin
    JSON.parse(arg, object_class: OpenStruct)
  rescue JSON::ParserError
    puts "Error parsing args: #{arg}"
    arg
  end
end

class Context
  attr_reader :trace_id, :flows, :file_name, :state, :logger

  def emit(event)
    # Add type field if not present to match Node.js/Python behavior
    event = { type: event[:type] || event['type'], data: event[:data] || event['data'] } unless event.is_a?(String)
    promise = @rpc.send('emit', event)
    promise  # Return promise to maintain async pattern
  end

  def initialize(rpc, args, file_path)
    @rpc = rpc
    @trace_id = args.traceId
    @flows = args.flows
    @file_name = file_path.split('/').last  # Consistent with Python/Node
    @state = RpcStateManager.new(rpc)
    @logger = CustomLogger.new(@trace_id, @flows, @file_name, @rpc)
  end
end

def run_ruby_module(file_path, args)
  rpc = nil
  begin
    unless File.exist?(file_path)
      raise LoadError, "Could not load module from #{file_path}"
    end

    # Load the file in a clean context
    load file_path

    unless defined?(handler)
      raise NameError, "Function 'handler' not found in module #{file_path}"
    end

    rpc = RpcSender.new
    context = Context.new(rpc, args, file_path)
    rpc.init

    # Call handler and wait for any promises
    result = handler(args.data, context)
    
    # If handler returns a promise-like object, wait for it
    if result.respond_to?(:value)
      result.value
    end

  rescue => e
    $stderr.puts "Error running Ruby module: #{e.message}"
    $stderr.puts e.backtrace
    raise
  ensure
    rpc&.close if rpc
  end
end

if __FILE__ == $PROGRAM_NAME
  if ARGV.length < 1
    $stderr.puts 'Usage: ruby ruby-runner.rb <file-path> <arg>'
    exit 1
  end

  file_path = ARGV[0]
  arg = ARGV[1] || nil

  begin
    parsed_args = parse_args(arg)
    run_ruby_module(file_path, parsed_args)
    exit 0
  rescue => e
    $stderr.puts "Error: #{e.message}"
    $stderr.puts e.backtrace
    exit 1
  end
end