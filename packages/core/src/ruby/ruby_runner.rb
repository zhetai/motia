require 'json'
require 'io/console'
require 'ostruct'
require 'pathname'
require_relative 'logger'
require_relative 'state_adapter'

# Parse arguments as JSON or fallback to raw string
def parse_args(arg)
  begin
    JSON.parse(arg, object_class: OpenStruct)
  rescue JSON::ParserError
    puts "Error parsing args: #{arg}"
    arg
  end
end

# Get the file descriptor from ENV
NODE_CHANNEL_FD = ENV['NODE_CHANNEL_FD'].to_i

# Context class for managing the execution environment
class Context
  attr_reader :trace_id, :flows, :file_name, :state, :logger

  # Emit a message to the parent process via Node IPC
  def emit(text)
    message = (JSON.dump(text) + "\n").encode('utf-8')
    IO.new(NODE_CHANNEL_FD, 'w').write(message)
  end

  def initialize(args, file_name)
    @trace_id = args.traceId
    @flows = args.flows
    @file_name = file_name
    @state = create_internal_state_manager(state_manager_url: args[:stateConfig]&.dig(:stateManagerUrl))
    @logger = CustomLogger.new(@trace_id, @flows, @file_name)
  end
end

# Dynamically load and execute a Ruby script
def run_ruby_module(file_path, args)
  unless File.exist?(file_path)
    raise LoadError, "Could not load module from #{file_path}"
  end

  # Load the file dynamically
  load file_path

  unless defined?(handler)
    raise NameError, "Function 'handler' not found in module #{file_path}"
  end

  context = Context.new(args, file_path)

  handler(args.data, context)
rescue => e
  $stderr.puts "Error running Ruby module: #{e.message}"
  $stderr.puts e.backtrace
  exit 1
end

# Entry point
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
  rescue => e
    $stderr.puts "Error: #{e.message}"
    $stderr.puts e.backtrace
    exit 1
  end
end
