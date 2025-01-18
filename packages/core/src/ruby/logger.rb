require 'json'
require 'time'

class CustomLogger
  def initialize(trace_id, flows, file_path)
    @trace_id = trace_id
    @flows = flows
    @file_name = File.basename(file_path)
  end

  def log(level, message, args = nil)
    # Ensure message is not nested JSON or a stringified JSON object
    if message.is_a?(String) && message.strip.start_with?('{', '[')
      begin
        message = JSON.parse(message) # Parse if valid JSON
      rescue JSON::ParserError
        # Leave message as is if it's not valid JSON
      end
    end

    # Construct the base log entry
    log_entry = {
      msg: message
    }

    # Merge additional arguments if provided
    if args
      args = case args
             when OpenStruct then args.to_h
             when Hash then args
             else { data: args }
             end
      log_entry.merge!(args)
    end

    # Generate JSON output
    puts JSON.dump(log_entry)
  end

  def info(message, args = nil)
    log('info', message, args)
  end

  def error(message, args = nil)
    log('error', message, args)
  end

  def debug(message, args = nil)
    log('debug', message, args)
  end

  def warn(message, args = nil)
    log('warn', message, args)
  end
end
