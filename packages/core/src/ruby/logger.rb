require 'json'
require 'time'

class Logger
  def initialize(trace_id, flows, file_path)
    @trace_id = trace_id
    @flows = flows
    @file_name = File.basename(file_path)
  end

  def log(level, message, args = nil)
    log_entry = {
      level: level,
      time: (Time.now.to_f * 1000).to_i, # Milliseconds since epoch
      traceId: @trace_id,
      flows: @flows,
      file: @file_name,
      msg: message
    }

    if args
      args = case args
             when OpenStruct then args.to_h
             when Hash then args
             else { data: args }
             end
      log_entry.merge!(args)
    end

    puts JSON.generate(log_entry)
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
