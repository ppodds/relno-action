expression = macro
    / string
    / bool
    / identifier {
        return {
            type: "Variable",
            name: text()
        }
    }
macro = funName:identifier args:macroCall {
    return {
        type: "Macro",
        funName,
        args: args
    };
}
macroCall = "(" arg1:expression? others:(_ "," _ @expression)* ")" {
    if (arg1) {
        return [arg1, ...others];
    } else {
        return [];
    }
}
string = doubleQuotedString / singleQuotedString
doubleQuotedString = '"' s:[^"]* '"' {
    return {
        type: "String",
        value: s.join("")
    }
}
singleQuotedString = "'" s:[^']* "'" {
    return {
        type: "String",
        value: s.join("")
    }
}
bool = "true" {
        return {
            type: "Boolean",
            value: true
        }
    }
    / "false" {
        return {
            type: "Boolean",
            value: false
        }
    }
identifier = a:[A-Za-z_]b:[A-Za-z0-9_-]* { return a + b.join(""); }
_ = [ \t]*