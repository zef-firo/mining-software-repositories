require 'json'

bfolders = ["games", "nongames"]

$categories = {
    "development" => {
        "code" => {
            "keywords" => ["source", "src", "tool", "include"],
            "ext" => ["cpp", "cc", "h", "hpp", "in", "c", "hxx", "java", "cs", "cxx", "hh"]
        },
        "utility" => {
            "keywords" => ["util", "test", "src", "source", "include", "build",	"comp"],
            "ext" => ["py", "pl", "js", "lua", "mk", "cmake", "m4", "sh", "dts", "s", "m", "ts"]
        },
        "library" => {
            "keywords" => ["lib", "data", "os", "arch"],
            "ext" => ["a", "so", "lib", "dll", "so", "zip", "rar", "7z", "gz", "bz2", "idl", "sci", "sce", "inc"]
        },
        "language" => {
            "keywords" => ["language", "lng", "i18n", "translation"],
            "ext" => ["po", "pot", "i18n", "txt", "xml", "xtb"]
        },
        "docs" => {
            "keywords" => ["doc", "man", "license", "guide", "package"],
            "ext" => ["tex", "txt", "html", "htm", "xml", "css", "pdf", "jpg", "png", "ico", "gif", "xht", "php", "md", "xhtml", "json"]
        },
        "security" => {
            "keywords" => [],
            "ext" => ["sha1", "crt"]
        },
        "test" => {
            "keywords" => [],
            "ext" => ["test", "result", "tst", ]
        }
    },
    "multimedia" => {
        "audio" => {
            "keywords" => [],
            "ext" => ["wav", "ogg", "mp3", "dsp"]
        },
        "image" => {
            "keywords" => ["image", "icon", "model", "scenery", "texture", "graphic", "planet", "font"],
            "ext" => ["png", "rgb", "ttf", "cfg", "map", "jpg", "gif", "ico", "svg", "dds", "xcf", "3ds", "txf", "eff", "glif", "odg", "icon"]
        },
        "data" => {
            "keywords" => ["image", "icon", "model", "scenery", "texture", "graphic", "planet"],
            "ext" => ["properties", "xml", "canvas", "effects", "in", "commands", "electrical", "extensions", "desktop", "textpb", "proto", "csv"]
        }
    },
    "other" => {
        "misc" => {
            "keywords" => ["misc", "other", "tool", "install"],
            "ext" => ["xml", "conf", "list", "cfg", "txt", "ocm", "lo", "patch", "mm", "gn", "ref", "opt", "ui", "mojom", "headers", "yml", "cnf", "chromium"]
        }
    }
}

$keywords = {}
$extensions = {}

$notfound_extensions = {}

$categories.each do |section, categories|
    categories.each do |category, content|
        content["keywords"].each { |k| $keywords[k] = {"section": section, "category": category} }
        content["ext"].each { |e| $extensions[e] = {"section": section, "category": category} }
    end
end

def newempty
    empty = {}
    $categories.each do |section, categories|
        empty[section] = {}
        categories.each do |category, content|
            empty[section][category] = {}
            empty[section][category]["total"] = 0
            empty[section][category]["dimension"] = 0
        end
    end
    empty["other"]["noext"] = {}
    empty["other"]["noext"]["total"] = 0;
    empty["other"]["noext"]["dimension"] = 0;
    empty["other"]["notfound"] = {}
    empty["other"]["notfound"]["total"] = 0;
    empty["other"]["notfound"]["dimension"] = 0;
    return empty
end

def scan (repo)
    empty = newempty
    Dir.glob(repo+"/**/*").each do |file|

        if !File.file?(file)
            next
        end

        notfound = true

        filedim = File.size(file)

        #find extension
        ext = File.extname(file).delete "."
        if ext.length != 0
            eindex = $extensions.keys.find_index(ext)
            if eindex
                notfound = false
                empty[ $extensions[ext][:section] ][ $extensions[ext][:category] ]["total"]+=1
                empty[ $extensions[ext][:section] ][ $extensions[ext][:category] ]["dimension"]+=filedim
            end
        else
            notfound = false
            empty["other"]["noext"]["total"]+=1
            empty["other"]["noext"]["dimension"]+=filedim
        end

        #find keyword in path
        patharray = file.split('/')
        $keywords.each do |k, content|
            if patharray.include? k
                notfound = false
                empty[ content[:section] ][ content[:category] ]["total"]+=1
                empty[ content[:section] ][ content[:category] ]["dimension"]+=filedim
            end
        end

        if notfound
            $notfound_extensions[ ext ] = $notfound_extensions[ ext ] ? $notfound_extensions[ ext ]+1 : 1;
            empty["other"]["notfound"]["total"]+=1
            empty["other"]["notfound"]["dimension"]+=filedim
        end

    end
    return empty
end

def categorize (basefolder)
    upper = {}
    Dir.glob(File.dirname(__dir__)+"/"+basefolder+"/*").each do |repo|
        puts "Scanning "+repo+"..."
        upper[repo.split('/').last] = scan repo
        puts "...done"
    end
    return upper
end

$analysis = {}
bfolders.each do |f| 
    $analysis[f] = categorize f
end

#write log
logfile = File.dirname(__dir__)+"/"+"logs/notfoundext_"+Time.now.to_i.to_s+".csv"
File.write(logfile, "extension,count\r\n", mode: "a")
$notfound_extensions.sort_by {|_key, value| value}.reverse!.each do |enotf,count|
    File.write(logfile, enotf+","+count.to_s+"\r\n", mode: "a")
end

#write result
resfile = File.dirname(__dir__)+"/"+"results/categorize.json"
File.write(resfile, $analysis.to_json)
