bfolders = ["../games", "../nongames"]

$categories = {
    "development" => {
        "code" => {
            "keywords" => ["source", "src", "tool", "include"],
            "ext" => ["cpp", "cc", "h", "hpp", "in"]
        },
        "utility" => {
            "keywords" => ["util", "test", "src", "source", "include", "build",	"comp"],
            "ext" => ["py", "pl", "js", "lua", "mk", "cmake", "m4"]
        },
        "library" => {
            "keywords" => ["lib", "data", "os", "arch"],
            "ext" => ["a", "so", "lib", "dll", "so", "zip", "rar", "7z", "gz", "bz2"]
        },
        "language" => {
            "keywords" => ["language", "lng", "i18n", "translation"],
            "ext" => ["po", "pot", "i18n", "txt", "xml"]
        },
        "docs" => {
            "keywords" => ["doc", "man", "license", "guide", "package"],
            "ext" => ["tex", "txt", "html", "htm", "xml", "css", "pdf", "jpg", "png", "ico", "gif"]
        }
    },
    "multimedia" => {
        "audio" => {
            "keywords" => [],
            "ext" => ["wav", "ogg", "mp3", "dsp"]
        },
        "image" => {
            "keywords" => ["image", "icon", "model", "scenery", "texture", "graphic", "planet", "font"],
            "ext" => ["png", "rgb", "ttf", "cfg", "map", "jpg", "gif", "ico", "svg", "dds", "xcf", "3ds", "txf", "eff"]
        },
        "data" => {
            "keywords" => ["image", "icon", "model", "scenery", "texture", "graphic", "planet"],
            "ext" => ["properties", "xml", "canvas", "effects", "in", "commands", "electrical", "extensions", "desktop"]
        }
    },
    "other" => {
        "misc" => {
            "keywords" => ["misc", "other", "tool", "install"],
            "ext" => ["xml", "conf", "list", "cfg", "txt", "ocm", "lo"]
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
            empty[section][category] = 0
        end
    end
    empty["other"]["noext"] = 0;
    empty["other"]["notfound"] = 0;
    return empty
end

def scan (repo)
    empty = newempty
    Dir.glob(repo+"/**/*").each do |file|

        notfound = true

        #find extension
        ext = File.extname(file).delete "."
        if ext.length != 0
            eindex = $extensions.keys.find_index(ext)
            if eindex
                notfound = false
                empty[ $extensions[ext][:section] ][ $extensions[ext][:category] ]+=1
            end
        else
            notfound = false
            empty["other"]["noext"]+=1
        end

        #find keyword in path
        patharray = file.split('/')
        $keywords.each do |k, content|
            if patharray.include? k
                notfound = false
                empty[ content[:section] ][ content[:category] ]+=1
            end
        end

        if notfound
            $notfound_extensions[ ext ] = $notfound_extensions[ ext ] ? $notfound_extensions[ ext ]+1 : 1;
            empty["other"]["notfound"]+=1
        end

    end
    return empty
end

def categorize (basefolder)
    Dir.glob(basefolder+"/*").each do |repo|
        res = scan repo
        puts "\r\n" + repo + " results are: "
        puts res
    end
end

bfolders.each { |f| categorize f }

logfile = "../logs/notfoundext_"+Time.now.to_i.to_s+".csv"
File.write(logfile, "extension,count\r\n", mode: "a")
$notfound_extensions.sort_by {|_key, value| value}.reverse!.each do |enotf,count|
    File.write(logfile, enotf+","+count.to_s+"\r\n", mode: "a")
end