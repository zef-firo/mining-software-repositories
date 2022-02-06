require 'json'

$occlimit = 1000

bfolders = ["games", "nongames"]

$ignore = ["where", ":", "missing", "out", "9", "this", "external", "at", "so", "set", "work", "we", "was", "flag", "h", "text", "name", "which", "no", "now", "are", "make", "after", "3:", "10", "*", "after", "v3", "file", "5", "license", "rt", "6", "some", "it", "all", "be", "Revert", "Use", "support", "files", "webkit", "more", "Added", "RESYNC:", "remove", "4", "use", "Update", "Change", "3", "code", "header", "new", "2:", "add", "0", "as", "Roll", "generated", "references", "Remove", "removed", "2", "Add", "INTEGRATION", "1:", "1", "(1", "FILE", "MERGED", "CWS", "-", "the", "is", "that", "", "to", "for", "a", "in", "of", "and", "from", "on", "with", "into", "when", "not", "by", "if"]

$bugrelated = ["bug", "Bug", "fix", "Fixes", "Fix", "fixes"]

$categories = {
    "Algorithm" => ["algorithm", "logic", "rendering", "calcula", "procedure", "problem solving", "math", "stack size", "bench script", "mistake", "defect"],
    "Concurrency" => ["race condition", "synchronization error", "deadlock"],
    "Failure" => ["reboot", "crash", "hang", "restart", "fault", "return failure", "segfault", "dump", "executable file", "error message", "segmentation", "stable", "exception", "not run", "not start"],
    "Graphic" => ["graphic", "resize", "overlap", "render", "shadow", "gui object", "frame", "ground", "window", "zoom", "water", "weapon"],
    "Memory" => ["memory leak", "null pointer", "heap overflow", "buffer overflow", "dangling pointer", "double free", "segmentation fault", "buf", "memleak", "memory leak", "overflow", "alloc"],
    "Performance" => ["optimization", "performance", "slow", "fast", "busy"],
    "Programming" => ["exception handling", "error handling", "type error", "typo", "compilation error", "copy-paste error", "pasting", "refactoring", "missing switch case", "missing check", "faulty initialization", "default value", "match error", "compil", "autotools", "build", "undefined pointer", "syntax error", "instruction", "64bit", "overloaded function", "translation", "engine", "not iniatializ"],
    "Security" => ["buffer overflow", "security", "password", "auth", "ssl", "exploit", "injection", "aes", "3des", "rc4", "access"],
    "Database" => ["mysql", "'mysql-5", "'mysql-8", "com:/home/bk/mysql-5", "com:/home/bk/mysql-4", "mysql-8", "MySQL", "MYSQL", "mysql", "mysql-trunk"],
    "Testing" => ["test", "tests", "testing", "Test", "unittest", "unittests", "Tests", "TEST", "testing"]
}

$mostoccurred = {}

def scan (repo)
    categorized = {}

    puts "Mining ("+repo+") ..."

    cmd = "git -C \""+repo+"\" log --pretty=\"##msrcommit##%h (%s, %cs)\" --stat"
    repolog = `#{cmd}`
    repoarr = repolog.encode!('UTF-8', 'binary', invalid: :replace, undef: :replace, replace: '').split(/##msrcommit##/, -1)
    count = 1
    repoarr.each do |commit|

        puts "...commit "+count.to_s+" of "+repoarr.size.to_s
        count=count+1

        if commit.to_s.strip.empty?
            next
        end
        
        commitencode = commit.encode!('UTF-8', 'binary', invalid: :replace, undef: :replace, replace: '')
        
        #detect commit size
        commitinsert = commitencode[/\.*\s([0-9]+)\sinsertion[s].*/, 1].to_i
        commitdelete = commitencode[/\.*\s([0-9]+)\sdeletion[s]+\.*/, 1].to_i
        commitsize = commitinsert+commitdelete

        found = false
        
        #categorize by commit message
        commitext = commitencode[/\((.*),\s+[0-9-]+\).*/, 1]
        if commitext.nil?
            next
        end

        commitarr = commitext.split(/[\s,.]/)

        commitarr.each do |word|
            $categories.each do |cat, kwords|
                if kwords.include? word
                    found = true

                    if !categorized[cat]
                        categorized[cat] = {
                            "total"=>0,
                            "dimension"=>0,
                            "bug"=>0
                        }
                    end

                    categorized[cat]["total"] = categorized[cat]["total"]+1
                    categorized[cat]["dimension"] = categorized[cat]["dimension"]+commitsize

                    #is it bug related?
                    if (commitarr & $bugrelated).any?
                        categorized[cat]["bug"] = categorized[cat]["bug"]+1
                    end

                end
            end
        end

        if !found
            categorized["Unknown"] = categorized["Unknown"] ? categorized["Unknown"]+1 : 1
            #tokenize not found and save occurrences
            commitarr.each do |word|
                unless $ignore.include? word
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
    if count>=$occlimit
        File.write(logfile, wnotf+","+count.to_s+"\r\n", mode: "a")
    end
end

#write result
resfile = File.dirname(__dir__)+"/"+"results/mining.json"
File.write(resfile, overall.to_json)
