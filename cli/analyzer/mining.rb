require 'json'

bfolders = ["games", "nongames"]

$stopwords = ["the", "is", "that", "", "to", "for", "a", "in", "of", "and", "from", "on", "with", "into"]

$categories = {
    "Algorithm" => ["algorithm", "logic", "rendering", "calcula", "procedure", "problem solving", "math", "stack size", "bench script", "mistake", "defect"],
    "Concurrency" => ["race condition", "synchronization error", "deadlock"],
    "Failure" => ["reboot", "crash", "hang", "restart", "fault", "return failure", "segfault", "dump", "executable file", "error message", "segmentation", "stable", "exception", "not run", "not start"],
    "Graphic" => ["graphic", "resize", "overlap", "render", "shadow", "gui object", "frame", "ground", "window", "zoom", "water", "weapon"],
    "Memory" => ["memory leak", "null pointer", "heap overflow", "buffer overflow", "dangling pointer", "double free", "segmentation fault", "buf", "memleak", "memory leak", "overflow", "alloc"],
    "Performance" => ["optimization", "performance", "slow", "fast", "busy"],
    "Programming" => ["exception handling", "error handling", "type error", "typo", "compilation error", "copy-paste error", "pasting", "refactoring", "missing switch case", "missing check", "faulty initialization", "default value", "match error", "compil", "autotools", "build", "undefined pointer", "syntax error", "instruction", "64bit", "overloaded function", "translation", "engine", "not iniatializ"],
    "Security" => ["buffer overflow", "security", "password", "auth", "ssl", "exploit", "injection", "aes", "3des", "rc4", "access"]
}

$mostoccurred = {}

def scan (repo)
    categorized = {}

    puts "Mining ("+repo+") ..."

    cmd = "git -C \""+repo+"\" log --pretty=reference"
    repolog = `#{cmd}`
    repolog.each_line do |commit|

        found = false
        
        commitarr = commit.encode!('UTF-8', 'binary', invalid: :replace, undef: :replace, replace: '')[/\((.*),\s+[0-9-]+\)/, 1].split(/[\s,.]/)
        commitarr.each do |word|
            $categories.each do |cat, kwords|
                if kwords.include? word
                    found = true
                    categorized[cat] = categorized[cat] ? categorized[cat]+1 : 1
                end
            end
        end

        if !found
            categorized["Unknown"] = categorized["Unknown"] ? categorized["Unknown"]+1 : 1
            #tokenize not found and save occurrences
            commitarr.each do |word|
                unless $stopwords.include? word
                    $mostoccurred[word] = $mostoccurred[word] ? $mostoccurred[word]+1 : 1;
                end
            end
        end

    end
    puts "...done"
    return categorized
end

def analyze (basefolder)
    pjs = {}
    Dir.glob(File.dirname(__dir__)+"/"+basefolder+"/*").each do |repo|
        pjs[repo.split('/').last] = scan repo
    end
    return pjs
end

overall = {}

bfolders.each do |f|
    overall[f] = analyze f
end

#write log
logfile = File.dirname(__dir__)+"/"+"logs/notfoundmining_"+Time.now.to_i.to_s+".csv"
File.write(logfile, "word,count\r\n", mode: "a")
$mostoccurred.sort_by {|_key, value| value}.reverse!.each do |wnotf,count|
    File.write(logfile, wnotf+","+count.to_s+"\r\n", mode: "a")
end

#write result
resfile = File.dirname(__dir__)+"/"+"results/mining.json"
File.write(resfile, overall.to_json)
