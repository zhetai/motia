require 'securerandom'
require 'json'
require 'thread'

# Get the file descriptor from ENV
NODE_CHANNEL_FD = ENV['NODE_CHANNEL_FD'].to_i

class RpcSender
  def initialize
    @closed = false
    @writer = IO.new(NODE_CHANNEL_FD, 'w')
    @reader = IO.new(NODE_CHANNEL_FD, 'r')
    @pending_requests = {}
    @mutex = Mutex.new
  end

  def send(method, args)
    return nil if @closed

    id = SecureRandom.uuid
    promise = Queue.new
    
    @mutex.synchronize do
      @pending_requests[id] = promise
    end

    data = { type: 'rpc_request', id: id, method: method, args: args }
    message = (JSON.dump(data) + "\n").encode('utf-8')

    @writer.write(message)
    @writer.flush

    result = promise.pop
    raise result if result.is_a?(StandardError)
    result
  end

  def send_no_wait(method, args)
    return if @closed

    data = { type: 'rpc_request', method: method, args: args }
    message = (JSON.dump(data) + "\n").encode('utf-8')

    @writer.write(message)
    @writer.flush
  rescue IOError, Errno::EBADF
    # Ignore errors during shutdown
  end

  def init
    @background_thread = Thread.new do
      until @closed
        begin
          line = @reader.gets
          if line
            msg = JSON.parse(line)
            handle_response(msg) if msg['type'] == 'rpc_response'
          end
        rescue IOError, Errno::EBADF
          break if @closed
        rescue => e
          puts "Error in RPC thread: #{e.message}"
        end
      end
    end
    
    @background_thread.abort_on_exception = true
  end

  def handle_response(msg)
    id = msg['id']
    return unless id

    @mutex.synchronize do
      if promise = @pending_requests.delete(id)
        if msg['error']
          promise.push(StandardError.new(msg['error']))
        else
          promise.push(msg['result'])
        end
      end
    end
  end

  def close
    return if @closed
    @closed = true

    # Send final close message
    begin
      send_no_wait('close', nil)
    rescue
      # Ignore errors during shutdown
    end

    # Clean up background thread
    if @background_thread
      @background_thread.kill rescue nil
      @background_thread.join(1) rescue nil
    end

    # Check for pending requests
    @mutex.synchronize do
      if @pending_requests.any?
        puts 'Process ended while there are some promises outstanding'
        exit(1)
      end
    end

    # Close file descriptors
    begin
      @writer.close unless @writer.closed?
    rescue
      # Ignore errors during shutdown
    end

    begin
      @reader.close unless @reader.closed?
    rescue
      # Ignore errors during shutdown
    end
  end
end