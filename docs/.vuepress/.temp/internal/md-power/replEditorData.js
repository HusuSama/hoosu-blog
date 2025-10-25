export default {
  "grammars": {
    "kotlin": {
      "displayName": "Kotlin",
      "fileTypes": [
        "kt",
        "kts"
      ],
      "name": "kotlin",
      "patterns": [
        {
          "include": "#import"
        },
        {
          "include": "#package"
        },
        {
          "include": "#code"
        }
      ],
      "repository": {
        "annotation-simple": {
          "match": "(?<!\\w)@[.\\w]+\\b(?!:)",
          "name": "entity.name.type.annotation.kotlin"
        },
        "annotation-site": {
          "begin": "(?<!\\w)(@\\w+):\\s*(?!\\[)",
          "beginCaptures": {
            "1": {
              "name": "entity.name.type.annotation-site.kotlin"
            }
          },
          "end": "$",
          "patterns": [
            {
              "include": "#unescaped-annotation"
            }
          ]
        },
        "annotation-site-list": {
          "begin": "(?<!\\w)(@\\w+):\\s*\\[",
          "beginCaptures": {
            "1": {
              "name": "entity.name.type.annotation-site.kotlin"
            }
          },
          "end": "]",
          "patterns": [
            {
              "include": "#unescaped-annotation"
            }
          ]
        },
        "binary-literal": {
          "match": "0([Bb])[01][01_]*",
          "name": "constant.numeric.binary.kotlin"
        },
        "boolean-literal": {
          "match": "\\b(true|false)\\b",
          "name": "constant.language.boolean.kotlin"
        },
        "character": {
          "begin": "'",
          "end": "'",
          "name": "string.quoted.single.kotlin",
          "patterns": [
            {
              "match": "\\\\.",
              "name": "constant.character.escape.kotlin"
            }
          ]
        },
        "class-declaration": {
          "captures": {
            "1": {
              "name": "keyword.hard.class.kotlin"
            },
            "2": {
              "name": "entity.name.type.class.kotlin"
            },
            "3": {
              "patterns": [
                {
                  "include": "#type-parameter"
                }
              ]
            }
          },
          "match": "\\b(class|(?:fun\\s+)?interface)\\s+(\\b\\w+\\b|`[^`]+`)\\s*(?<GROUP><([^<>]|\\g<GROUP>)+>)?"
        },
        "code": {
          "patterns": [
            {
              "include": "#comments"
            },
            {
              "include": "#keywords"
            },
            {
              "include": "#annotation-simple"
            },
            {
              "include": "#annotation-site-list"
            },
            {
              "include": "#annotation-site"
            },
            {
              "include": "#class-declaration"
            },
            {
              "include": "#object"
            },
            {
              "include": "#type-alias"
            },
            {
              "include": "#function"
            },
            {
              "include": "#variable-declaration"
            },
            {
              "include": "#type-constraint"
            },
            {
              "include": "#type-annotation"
            },
            {
              "include": "#function-call"
            },
            {
              "include": "#method-reference"
            },
            {
              "include": "#key"
            },
            {
              "include": "#string"
            },
            {
              "include": "#string-empty"
            },
            {
              "include": "#string-multiline"
            },
            {
              "include": "#character"
            },
            {
              "include": "#lambda-arrow"
            },
            {
              "include": "#operators"
            },
            {
              "include": "#self-reference"
            },
            {
              "include": "#decimal-literal"
            },
            {
              "include": "#hex-literal"
            },
            {
              "include": "#binary-literal"
            },
            {
              "include": "#boolean-literal"
            },
            {
              "include": "#null-literal"
            }
          ]
        },
        "comment-block": {
          "begin": "/\\*(?!\\*)",
          "end": "\\*/",
          "name": "comment.block.kotlin"
        },
        "comment-javadoc": {
          "patterns": [
            {
              "begin": "/\\*\\*",
              "end": "\\*/",
              "name": "comment.block.javadoc.kotlin",
              "patterns": [
                {
                  "match": "@(return|constructor|receiver|sample|see|author|since|suppress)\\b",
                  "name": "keyword.other.documentation.javadoc.kotlin"
                },
                {
                  "captures": {
                    "1": {
                      "name": "keyword.other.documentation.javadoc.kotlin"
                    },
                    "2": {
                      "name": "variable.parameter.kotlin"
                    }
                  },
                  "match": "(@p(?:aram|roperty))\\s+(\\S+)"
                },
                {
                  "captures": {
                    "1": {
                      "name": "keyword.other.documentation.javadoc.kotlin"
                    },
                    "2": {
                      "name": "variable.parameter.kotlin"
                    }
                  },
                  "match": "(@param)\\[(\\S+)]"
                },
                {
                  "captures": {
                    "1": {
                      "name": "keyword.other.documentation.javadoc.kotlin"
                    },
                    "2": {
                      "name": "entity.name.type.class.kotlin"
                    }
                  },
                  "match": "(@(?:exception|throws))\\s+(\\S+)"
                },
                {
                  "captures": {
                    "1": {
                      "name": "keyword.other.documentation.javadoc.kotlin"
                    },
                    "2": {
                      "name": "entity.name.type.class.kotlin"
                    },
                    "3": {
                      "name": "variable.parameter.kotlin"
                    }
                  },
                  "match": "\\{(@link)\\s+(\\S+)?#([$\\w]+\\s*\\([^()]*\\)).*}"
                }
              ]
            }
          ]
        },
        "comment-line": {
          "begin": "//",
          "end": "$",
          "name": "comment.line.double-slash.kotlin"
        },
        "comments": {
          "patterns": [
            {
              "include": "#comment-line"
            },
            {
              "include": "#comment-block"
            },
            {
              "include": "#comment-javadoc"
            }
          ]
        },
        "control-keywords": {
          "match": "\\b(if|else|while|do|when|try|throw|break|continue|return|for)\\b",
          "name": "keyword.control.kotlin"
        },
        "decimal-literal": {
          "match": "\\b\\d[_\\d]*(\\.[_\\d]+)?(([Ee])\\d+)?([Uu])?([FLf])?\\b",
          "name": "constant.numeric.decimal.kotlin"
        },
        "function": {
          "captures": {
            "1": {
              "name": "keyword.hard.fun.kotlin"
            },
            "2": {
              "patterns": [
                {
                  "include": "#type-parameter"
                }
              ]
            },
            "4": {
              "name": "entity.name.type.class.extension.kotlin"
            },
            "5": {
              "name": "entity.name.function.declaration.kotlin"
            }
          },
          "match": "\\b(fun)\\b\\s*(?<GROUP><([^<>]|\\g<GROUP>)+>)?\\s*(?:(?:(\\w+)\\.)?(\\b\\w+\\b|`[^`]+`))?"
        },
        "function-call": {
          "captures": {
            "1": {
              "name": "entity.name.function.call.kotlin"
            },
            "2": {
              "patterns": [
                {
                  "include": "#type-parameter"
                }
              ]
            }
          },
          "match": "\\??\\.?(\\b\\w+\\b|`[^`]+`)\\s*(?<GROUP><([^<>]|\\g<GROUP>)+>)?\\s*(?=[({])"
        },
        "hard-keywords": {
          "match": "\\b(as|typeof|is|in)\\b",
          "name": "keyword.hard.kotlin"
        },
        "hex-literal": {
          "match": "0([Xx])\\h[_\\h]*([Uu])?",
          "name": "constant.numeric.hex.kotlin"
        },
        "import": {
          "begin": "\\b(import)\\b\\s*",
          "beginCaptures": {
            "1": {
              "name": "keyword.soft.kotlin"
            }
          },
          "contentName": "entity.name.package.kotlin",
          "end": ";|$",
          "name": "meta.import.kotlin",
          "patterns": [
            {
              "include": "#comments"
            },
            {
              "include": "#hard-keywords"
            },
            {
              "match": "\\*",
              "name": "variable.language.wildcard.kotlin"
            }
          ]
        },
        "key": {
          "captures": {
            "1": {
              "name": "variable.parameter.kotlin"
            },
            "2": {
              "name": "keyword.operator.assignment.kotlin"
            }
          },
          "match": "\\b(\\w=)\\s*(=)"
        },
        "keywords": {
          "patterns": [
            {
              "include": "#prefix-modifiers"
            },
            {
              "include": "#postfix-modifiers"
            },
            {
              "include": "#soft-keywords"
            },
            {
              "include": "#hard-keywords"
            },
            {
              "include": "#control-keywords"
            }
          ]
        },
        "lambda-arrow": {
          "match": "->",
          "name": "storage.type.function.arrow.kotlin"
        },
        "method-reference": {
          "captures": {
            "1": {
              "name": "entity.name.function.reference.kotlin"
            }
          },
          "match": "\\??::(\\b\\w+\\b|`[^`]+`)"
        },
        "null-literal": {
          "match": "\\bnull\\b",
          "name": "constant.language.null.kotlin"
        },
        "object": {
          "captures": {
            "1": {
              "name": "keyword.hard.object.kotlin"
            },
            "2": {
              "name": "entity.name.type.object.kotlin"
            }
          },
          "match": "\\b(object)(?:\\s+(\\b\\w+\\b|`[^`]+`))?"
        },
        "operators": {
          "patterns": [
            {
              "match": "(===?|!==?|<=|>=|[<>])",
              "name": "keyword.operator.comparison.kotlin"
            },
            {
              "match": "([-%*+/]=)",
              "name": "keyword.operator.assignment.arithmetic.kotlin"
            },
            {
              "match": "(=)",
              "name": "keyword.operator.assignment.kotlin"
            },
            {
              "match": "([-%*+/])",
              "name": "keyword.operator.arithmetic.kotlin"
            },
            {
              "match": "(!|&&|\\|\\|)",
              "name": "keyword.operator.logical.kotlin"
            },
            {
              "match": "(--|\\+\\+)",
              "name": "keyword.operator.increment-decrement.kotlin"
            },
            {
              "match": "(\\.\\.)",
              "name": "keyword.operator.range.kotlin"
            }
          ]
        },
        "package": {
          "begin": "\\b(package)\\b\\s*",
          "beginCaptures": {
            "1": {
              "name": "keyword.hard.package.kotlin"
            }
          },
          "contentName": "entity.name.package.kotlin",
          "end": ";|$",
          "name": "meta.package.kotlin",
          "patterns": [
            {
              "include": "#comments"
            }
          ]
        },
        "postfix-modifiers": {
          "match": "\\b(where|by|get|set)\\b",
          "name": "storage.modifier.other.kotlin"
        },
        "prefix-modifiers": {
          "match": "\\b(abstract|final|enum|open|annotation|sealed|data|override|final|lateinit|private|protected|public|internal|inner|companion|noinline|crossinline|vararg|reified|tailrec|operator|infix|inline|external|const|suspend|value)\\b",
          "name": "storage.modifier.other.kotlin"
        },
        "self-reference": {
          "match": "\\b(this|super)(@\\w+)?\\b",
          "name": "variable.language.this.kotlin"
        },
        "soft-keywords": {
          "match": "\\b(init|catch|finally|field)\\b",
          "name": "keyword.soft.kotlin"
        },
        "string": {
          "begin": "(?<!\")\"(?!\")",
          "end": "\"",
          "name": "string.quoted.double.kotlin",
          "patterns": [
            {
              "match": "\\\\.",
              "name": "constant.character.escape.kotlin"
            },
            {
              "include": "#string-escape-simple"
            },
            {
              "include": "#string-escape-bracketed"
            }
          ]
        },
        "string-empty": {
          "match": "(?<!\")\"\"(?!\")",
          "name": "string.quoted.double.kotlin"
        },
        "string-escape-bracketed": {
          "begin": "(?<!\\\\)(\\$\\{)",
          "beginCaptures": {
            "1": {
              "name": "punctuation.definition.template-expression.begin"
            }
          },
          "end": "(})",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.template-expression.end"
            }
          },
          "name": "meta.template.expression.kotlin",
          "patterns": [
            {
              "include": "#code"
            }
          ]
        },
        "string-escape-simple": {
          "match": "(?<!\\\\)\\$\\w+\\b",
          "name": "variable.string-escape.kotlin"
        },
        "string-multiline": {
          "begin": "\"\"\"",
          "end": "\"\"\"",
          "name": "string.quoted.double.kotlin",
          "patterns": [
            {
              "match": "\\\\.",
              "name": "constant.character.escape.kotlin"
            },
            {
              "include": "#string-escape-simple"
            },
            {
              "include": "#string-escape-bracketed"
            }
          ]
        },
        "type-alias": {
          "captures": {
            "1": {
              "name": "keyword.hard.typealias.kotlin"
            },
            "2": {
              "name": "entity.name.type.kotlin"
            },
            "3": {
              "patterns": [
                {
                  "include": "#type-parameter"
                }
              ]
            }
          },
          "match": "\\b(typealias)\\s+(\\b\\w+\\b|`[^`]+`)\\s*(?<GROUP><([^<>]|\\g<GROUP>)+>)?"
        },
        "type-annotation": {
          "captures": {
            "0": {
              "patterns": [
                {
                  "include": "#type-parameter"
                }
              ]
            }
          },
          "match": "(?<![:?]):\\s*([?\\w\\s]|->|(?<GROUP>[(<]([^\"'()<>]|\\g<GROUP>)+[)>]))+"
        },
        "type-parameter": {
          "patterns": [
            {
              "match": "\\b\\w+\\b",
              "name": "entity.name.type.kotlin"
            },
            {
              "match": "\\b(in|out)\\b",
              "name": "storage.modifier.kotlin"
            }
          ]
        },
        "unescaped-annotation": {
          "match": "\\b[.\\w]+\\b",
          "name": "entity.name.type.annotation.kotlin"
        },
        "variable-declaration": {
          "captures": {
            "1": {
              "name": "keyword.hard.kotlin"
            },
            "2": {
              "patterns": [
                {
                  "include": "#type-parameter"
                }
              ]
            }
          },
          "match": "\\b(va[lr])\\b\\s*(?<GROUP><([^<>]|\\g<GROUP>)+>)?"
        }
      },
      "scopeName": "source.kotlin"
    },
    "go": {
      "displayName": "Go",
      "name": "go",
      "patterns": [
        {
          "include": "#statements"
        }
      ],
      "repository": {
        "after_control_variables": {
          "captures": {
            "1": {
              "patterns": [
                {
                  "include": "#type-declarations-without-brackets"
                },
                {
                  "match": "\\[",
                  "name": "punctuation.definition.begin.bracket.square.go"
                },
                {
                  "match": "]",
                  "name": "punctuation.definition.end.bracket.square.go"
                },
                {
                  "match": "\\w+",
                  "name": "variable.other.go"
                }
              ]
            }
          },
          "match": "(?<=\\brange\\b|;|\\bif\\b|\\bfor\\b|[<>]|<=|>=|==|!=|\\w[-%*+/]|\\w[-%*+/]=|\\|\\||&&)\\s*((?![]\\[]+)[-\\]!%*+./:<=>\\[_[:alnum:]]+)\\s*(?=\\{)"
        },
        "brackets": {
          "patterns": [
            {
              "begin": "\\{",
              "beginCaptures": {
                "0": {
                  "name": "punctuation.definition.begin.bracket.curly.go"
                }
              },
              "end": "}",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.curly.go"
                }
              },
              "patterns": [
                {
                  "include": "$self"
                }
              ]
            },
            {
              "begin": "\\(",
              "beginCaptures": {
                "0": {
                  "name": "punctuation.definition.begin.bracket.round.go"
                }
              },
              "end": "\\)",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.round.go"
                }
              },
              "patterns": [
                {
                  "include": "$self"
                }
              ]
            },
            {
              "begin": "\\[",
              "beginCaptures": {
                "0": {
                  "name": "punctuation.definition.begin.bracket.square.go"
                }
              },
              "end": "]",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.square.go"
                }
              },
              "patterns": [
                {
                  "include": "$self"
                }
              ]
            }
          ]
        },
        "built_in_functions": {
          "patterns": [
            {
              "match": "\\b(append|cap|close|complex|copy|delete|imag|len|panic|print|println|real|recover|min|max|clear)\\b(?=\\()",
              "name": "entity.name.function.support.builtin.go"
            },
            {
              "begin": "\\b(new)\\b(\\()",
              "beginCaptures": {
                "1": {
                  "name": "entity.name.function.support.builtin.go"
                },
                "2": {
                  "name": "punctuation.definition.begin.bracket.round.go"
                }
              },
              "end": "\\)",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.round.go"
                }
              },
              "patterns": [
                {
                  "include": "#functions"
                },
                {
                  "include": "#struct_variables_types"
                },
                {
                  "include": "#type-declarations"
                },
                {
                  "include": "#generic_types"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.type.go"
                },
                {
                  "include": "$self"
                }
              ]
            },
            {
              "begin": "\\b(make)\\b(\\()((?:(?:[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+(?:\\([^)]+\\))?)?[]*\\[]+{0,1}(?:(?!\\bmap\\b)[.\\w]+)?(\\[(?:\\S+(?:,\\s*\\S+)*)?])?,?)?",
              "beginCaptures": {
                "1": {
                  "name": "entity.name.function.support.builtin.go"
                },
                "2": {
                  "name": "punctuation.definition.begin.bracket.round.go"
                },
                "3": {
                  "patterns": [
                    {
                      "include": "#type-declarations-without-brackets"
                    },
                    {
                      "include": "#parameter-variable-types"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "end": "\\)",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.round.go"
                }
              },
              "patterns": [
                {
                  "include": "$self"
                }
              ]
            }
          ]
        },
        "comments": {
          "patterns": [
            {
              "begin": "(/\\*)",
              "beginCaptures": {
                "1": {
                  "name": "punctuation.definition.comment.go"
                }
              },
              "end": "(\\*/)",
              "endCaptures": {
                "1": {
                  "name": "punctuation.definition.comment.go"
                }
              },
              "name": "comment.block.go"
            },
            {
              "begin": "(//)",
              "beginCaptures": {
                "1": {
                  "name": "punctuation.definition.comment.go"
                }
              },
              "end": "\\n|$",
              "name": "comment.line.double-slash.go"
            }
          ]
        },
        "const_assignment": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#delimiters"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.other.constant.go"
                    }
                  ]
                },
                "2": {
                  "patterns": [
                    {
                      "include": "#type-declarations-without-brackets"
                    },
                    {
                      "include": "#generic_types"
                    },
                    {
                      "match": "\\(",
                      "name": "punctuation.definition.begin.bracket.round.go"
                    },
                    {
                      "match": "\\)",
                      "name": "punctuation.definition.end.bracket.round.go"
                    },
                    {
                      "match": "\\[",
                      "name": "punctuation.definition.begin.bracket.square.go"
                    },
                    {
                      "match": "]",
                      "name": "punctuation.definition.end.bracket.square.go"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "(?<=\\bconst\\b)\\s*\\b([.\\w]+(?:,\\s*[.\\w]+)*)\\s*((?:(?:[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+(?:\\([^)]+\\))?)?(?![]*\\[]+{0,1}\\b(?:struct|func|map)\\b)(?:[]*.\\[\\w]+(?:,\\s*[]*.\\[\\w]+)*)?\\s*=?)?"
            },
            {
              "begin": "(?<=\\bconst\\b)\\s*(\\()",
              "beginCaptures": {
                "1": {
                  "name": "punctuation.definition.begin.bracket.round.go"
                }
              },
              "end": "\\)",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.round.go"
                }
              },
              "patterns": [
                {
                  "captures": {
                    "1": {
                      "patterns": [
                        {
                          "include": "#delimiters"
                        },
                        {
                          "match": "\\w+",
                          "name": "variable.other.constant.go"
                        }
                      ]
                    },
                    "2": {
                      "patterns": [
                        {
                          "include": "#type-declarations-without-brackets"
                        },
                        {
                          "include": "#generic_types"
                        },
                        {
                          "match": "\\(",
                          "name": "punctuation.definition.begin.bracket.round.go"
                        },
                        {
                          "match": "\\)",
                          "name": "punctuation.definition.end.bracket.round.go"
                        },
                        {
                          "match": "\\[",
                          "name": "punctuation.definition.begin.bracket.square.go"
                        },
                        {
                          "match": "]",
                          "name": "punctuation.definition.end.bracket.square.go"
                        },
                        {
                          "match": "\\w+",
                          "name": "entity.name.type.go"
                        }
                      ]
                    }
                  },
                  "match": "^\\s*\\b([.\\w]+(?:,\\s*[.\\w]+)*)\\s*((?:(?:[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+(?:\\([^)]+\\))?)?(?![]*\\[]+{0,1}\\b(?:struct|func|map)\\b)(?:[]*.\\[\\w]+(?:,\\s*[]*.\\[\\w]+)*)?\\s*=?)?"
                },
                {
                  "include": "$self"
                }
              ]
            }
          ]
        },
        "delimiters": {
          "patterns": [
            {
              "match": ",",
              "name": "punctuation.other.comma.go"
            },
            {
              "match": "\\.(?!\\.\\.)",
              "name": "punctuation.other.period.go"
            },
            {
              "match": ":(?!=)",
              "name": "punctuation.other.colon.go"
            }
          ]
        },
        "double_parentheses_types": {
          "captures": {
            "1": {
              "patterns": [
                {
                  "include": "#type-declarations-without-brackets"
                },
                {
                  "match": "\\(",
                  "name": "punctuation.definition.begin.bracket.round.go"
                },
                {
                  "match": "\\)",
                  "name": "punctuation.definition.end.bracket.round.go"
                },
                {
                  "match": "\\[",
                  "name": "punctuation.definition.begin.bracket.square.go"
                },
                {
                  "match": "]",
                  "name": "punctuation.definition.end.bracket.square.go"
                },
                {
                  "match": "\\{",
                  "name": "punctuation.definition.begin.bracket.curly.go"
                },
                {
                  "match": "}",
                  "name": "punctuation.definition.end.bracket.curly.go"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.type.go"
                }
              ]
            }
          },
          "match": "(?<!\\w)(\\([]*\\[]+{0,1}[.\\w]+(?:\\[(?:[]*.\\[{}\\w]+(?:,\\s*[]*.\\[{}\\w]+)*)?])?\\))(?=\\()"
        },
        "function_declaration": {
          "begin": "^\\b(func)\\b\\s*(\\([^)]+\\)\\s*)?(?:(\\w+)(?=[(\\[]))?",
          "beginCaptures": {
            "1": {
              "name": "keyword.function.go"
            },
            "2": {
              "patterns": [
                {
                  "begin": "\\(",
                  "beginCaptures": {
                    "0": {
                      "name": "punctuation.definition.begin.bracket.round.go"
                    }
                  },
                  "end": "\\)",
                  "endCaptures": {
                    "0": {
                      "name": "punctuation.definition.end.bracket.round.go"
                    }
                  },
                  "patterns": [
                    {
                      "captures": {
                        "1": {
                          "name": "variable.parameter.go"
                        },
                        "2": {
                          "patterns": [
                            {
                              "include": "#type-declarations-without-brackets"
                            },
                            {
                              "include": "#parameter-variable-types"
                            },
                            {
                              "match": "\\w+",
                              "name": "entity.name.type.go"
                            }
                          ]
                        }
                      },
                      "match": "(\\w+\\s+)?([*.\\w]+(?:\\[(?:[*.\\w]+(?:,\\s+)?)+{0,1}])?)"
                    },
                    {
                      "include": "$self"
                    }
                  ]
                }
              ]
            },
            "3": {
              "patterns": [
                {
                  "match": "\\d\\w*",
                  "name": "invalid.illegal.identifier.go"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.function.go"
                }
              ]
            }
          },
          "end": "(?<=\\))\\s*((?:[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}(?![]*\\[]+{0,1}\\b(?:struct|interface)\\b)[-\\]*.\\[\\w]+)?\\s*(?=\\{)",
          "endCaptures": {
            "1": {
              "patterns": [
                {
                  "include": "#type-declarations-without-brackets"
                },
                {
                  "include": "#parameter-variable-types"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.type.go"
                }
              ]
            }
          },
          "patterns": [
            {
              "begin": "\\(",
              "beginCaptures": {
                "0": {
                  "name": "punctuation.definition.begin.bracket.round.go"
                }
              },
              "end": "\\)",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.round.go"
                }
              },
              "patterns": [
                {
                  "include": "#function_param_types"
                }
              ]
            },
            {
              "begin": "([*.\\w]+)?(\\[)",
              "beginCaptures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                },
                "2": {
                  "name": "punctuation.definition.begin.bracket.square.go"
                }
              },
              "end": "]",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.square.go"
                }
              },
              "patterns": [
                {
                  "include": "#generic_param_types"
                }
              ]
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations-without-brackets"
                    },
                    {
                      "include": "#parameter-variable-types"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "(?<=\\))\\s*((?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}[-\\]*.<>\\[\\w]+\\s*(?:/[*/].*)?)$"
            },
            {
              "include": "$self"
            }
          ]
        },
        "function_param_types": {
          "patterns": [
            {
              "include": "#struct_variables_types"
            },
            {
              "include": "#interface_variables_types"
            },
            {
              "include": "#type-declarations-without-brackets"
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.parameter.go"
                    }
                  ]
                }
              },
              "match": "((?:\\b\\w+,\\s*)+{0,1}\\b\\w+)\\s+(?=(?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}[]*\\[]+{0,1}\\b(?:struct|interface)\\b\\s*\\{)"
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.parameter.go"
                    }
                  ]
                }
              },
              "match": "(?:(?<=\\()|^\\s*)((?:\\b\\w+,\\s*)+(?:/[*/].*)?)$"
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#delimiters"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.parameter.go"
                    }
                  ]
                },
                "2": {
                  "patterns": [
                    {
                      "include": "#type-declarations-without-brackets"
                    },
                    {
                      "include": "#parameter-variable-types"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "((?:\\b\\w+,\\s*)+{0,1}\\b\\w+)\\s+((?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}(?:[]*.\\[\\w]+{0,1}(?:\\bfunc\\b\\([^)]+{0,1}\\)(?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}\\s*)+(?:[]*.\\[\\w]+|\\([^)]+{0,1}\\))?|(?:[]*\\[]+{0,1}[*.\\w]+(?:\\[[^]]+])?[*.\\w]+{0,1})+))"
            },
            {
              "begin": "([*.\\w]+)?(\\[)",
              "beginCaptures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                },
                "2": {
                  "name": "punctuation.definition.begin.bracket.square.go"
                }
              },
              "end": "]",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.square.go"
                }
              },
              "patterns": [
                {
                  "include": "#generic_param_types"
                }
              ]
            },
            {
              "begin": "\\(",
              "beginCaptures": {
                "0": {
                  "name": "punctuation.definition.begin.bracket.round.go"
                }
              },
              "end": "\\)",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.round.go"
                }
              },
              "patterns": [
                {
                  "include": "#function_param_types"
                }
              ]
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "([.\\w]+)"
            },
            {
              "include": "$self"
            }
          ]
        },
        "functions": {
          "begin": "\\b(func)\\b(?=\\()",
          "beginCaptures": {
            "1": {
              "name": "keyword.function.go"
            }
          },
          "end": "(?<=\\))(\\s*(?:[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+)?(\\s*(?:[]*\\[]+{0,1}[*.\\w]+)?(?:\\[(?:[*.\\w]+{0,1}(?:\\[[^]]+{0,1}])?(?:,\\s+)?)+]|\\([^)]+{0,1}\\))?[*.\\w]+{0,1}\\s*(?=\\{)|\\s*(?:[]*\\[]+{0,1}(?!\\bfunc\\b)[*.\\w]+(?:\\[(?:[*.\\w]+{0,1}(?:\\[[^]]+{0,1}])?(?:,\\s+)?)+])?[*.\\w]+{0,1}|\\([^)]+{0,1}\\)))?",
          "endCaptures": {
            "1": {
              "patterns": [
                {
                  "include": "#type-declarations"
                }
              ]
            },
            "2": {
              "patterns": [
                {
                  "include": "#type-declarations-without-brackets"
                },
                {
                  "include": "#parameter-variable-types"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.type.go"
                }
              ]
            }
          },
          "patterns": [
            {
              "include": "#parameter-variable-types"
            }
          ]
        },
        "functions_inline": {
          "captures": {
            "1": {
              "name": "keyword.function.go"
            },
            "2": {
              "patterns": [
                {
                  "include": "#type-declarations-without-brackets"
                },
                {
                  "begin": "\\(",
                  "beginCaptures": {
                    "0": {
                      "name": "punctuation.definition.begin.bracket.round.go"
                    }
                  },
                  "end": "\\)",
                  "endCaptures": {
                    "0": {
                      "name": "punctuation.definition.end.bracket.round.go"
                    }
                  },
                  "patterns": [
                    {
                      "include": "#function_param_types"
                    },
                    {
                      "include": "$self"
                    }
                  ]
                },
                {
                  "match": "\\[",
                  "name": "punctuation.definition.begin.bracket.square.go"
                },
                {
                  "match": "]",
                  "name": "punctuation.definition.end.bracket.square.go"
                },
                {
                  "match": "\\{",
                  "name": "punctuation.definition.begin.bracket.curly.go"
                },
                {
                  "match": "}",
                  "name": "punctuation.definition.end.bracket.curly.go"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.type.go"
                }
              ]
            }
          },
          "match": "\\b(func)\\b(\\([^/]*?\\)\\s+\\([^/]*?\\))\\s+(?=\\{)"
        },
        "generic_param_types": {
          "patterns": [
            {
              "include": "#struct_variables_types"
            },
            {
              "include": "#interface_variables_types"
            },
            {
              "include": "#type-declarations-without-brackets"
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.parameter.go"
                    }
                  ]
                }
              },
              "match": "((?:\\b\\w+,\\s*)+{0,1}\\b\\w+)\\s+(?=(?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}[]*\\[]+{0,1}\\b(?:struct|interface)\\b\\s*\\{)"
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.parameter.go"
                    }
                  ]
                }
              },
              "match": "(?:(?<=\\()|^\\s*)((?:\\b\\w+,\\s*)+(?:/[*/].*)?)$"
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#delimiters"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.parameter.go"
                    }
                  ]
                },
                "2": {
                  "patterns": [
                    {
                      "include": "#type-declarations-without-brackets"
                    },
                    {
                      "include": "#parameter-variable-types"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                },
                "3": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "((?:\\b\\w+,\\s*)+{0,1}\\b\\w+)\\s+((?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}(?:[]*.\\[\\w]+{0,1}(?:\\bfunc\\b\\([^)]+{0,1}\\)(?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}\\s*)+(?:[*.\\w]+|\\([^)]+{0,1}\\))?|(?:(?:[*.~\\w]+|\\[(?:[*.\\w]+{0,1}(?:\\[[^]]+{0,1}])?(?:,\\s+)?)+])[*.\\w]+{0,1})+))"
            },
            {
              "begin": "([*.\\w]+)?(\\[)",
              "beginCaptures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                },
                "2": {
                  "name": "punctuation.definition.begin.bracket.square.go"
                }
              },
              "end": "]",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.square.go"
                }
              },
              "patterns": [
                {
                  "include": "#generic_param_types"
                }
              ]
            },
            {
              "begin": "\\(",
              "beginCaptures": {
                "0": {
                  "name": "punctuation.definition.begin.bracket.round.go"
                }
              },
              "end": "\\)",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.round.go"
                }
              },
              "patterns": [
                {
                  "include": "#function_param_types"
                }
              ]
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "\\b([.\\w]+)"
            },
            {
              "include": "$self"
            }
          ]
        },
        "generic_types": {
          "captures": {
            "1": {
              "patterns": [
                {
                  "include": "#type-declarations"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.type.go"
                }
              ]
            },
            "2": {
              "patterns": [
                {
                  "include": "#parameter-variable-types"
                }
              ]
            }
          },
          "match": "([*.\\w]+)(\\[[^]]+{0,1}])"
        },
        "group-functions": {
          "patterns": [
            {
              "include": "#function_declaration"
            },
            {
              "include": "#functions_inline"
            },
            {
              "include": "#functions"
            },
            {
              "include": "#built_in_functions"
            },
            {
              "include": "#support_functions"
            }
          ]
        },
        "group-types": {
          "patterns": [
            {
              "include": "#other_struct_interface_expressions"
            },
            {
              "include": "#type_assertion_inline"
            },
            {
              "include": "#struct_variables_types"
            },
            {
              "include": "#interface_variables_types"
            },
            {
              "include": "#single_type"
            },
            {
              "include": "#multi_types"
            },
            {
              "include": "#struct_interface_declaration"
            },
            {
              "include": "#double_parentheses_types"
            },
            {
              "include": "#switch_types"
            },
            {
              "include": "#type-declarations"
            }
          ]
        },
        "group-variables": {
          "patterns": [
            {
              "include": "#const_assignment"
            },
            {
              "include": "#var_assignment"
            },
            {
              "include": "#variable_assignment"
            },
            {
              "include": "#label_loop_variables"
            },
            {
              "include": "#slice_index_variables"
            },
            {
              "include": "#property_variables"
            },
            {
              "include": "#switch_variables"
            },
            {
              "include": "#other_variables"
            }
          ]
        },
        "hover": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.other.property.go"
                    }
                  ]
                },
                "2": {
                  "patterns": [
                    {
                      "match": "\\binvalid\\b\\s+\\btype\\b",
                      "name": "invalid.field.go"
                    },
                    {
                      "include": "#type-declarations-without-brackets"
                    },
                    {
                      "include": "#parameter-variable-types"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "(?<=^\\bfield\\b)\\s+([*.\\w]+)\\s+([\\s\\S]+)"
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations-without-brackets"
                    },
                    {
                      "include": "#parameter-variable-types"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "(?<=^\\breturns\\b)\\s+([\\s\\S]+)"
            }
          ]
        },
        "import": {
          "patterns": [
            {
              "begin": "\\b(import)\\s+",
              "beginCaptures": {
                "1": {
                  "name": "keyword.control.import.go"
                }
              },
              "end": "(?!\\G)",
              "patterns": [
                {
                  "include": "#imports"
                }
              ]
            }
          ]
        },
        "imports": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#delimiters"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.other.import.go"
                    }
                  ]
                },
                "2": {
                  "name": "string.quoted.double.go"
                },
                "3": {
                  "name": "punctuation.definition.string.begin.go"
                },
                "4": {
                  "name": "entity.name.import.go"
                },
                "5": {
                  "name": "punctuation.definition.string.end.go"
                }
              },
              "match": "(\\s*[.\\w]+)?\\s*((\")([^\"]*)(\"))"
            },
            {
              "begin": "\\(",
              "beginCaptures": {
                "0": {
                  "name": "punctuation.definition.imports.begin.bracket.round.go"
                }
              },
              "end": "\\)",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.imports.end.bracket.round.go"
                }
              },
              "patterns": [
                {
                  "include": "#comments"
                },
                {
                  "include": "#imports"
                }
              ]
            },
            {
              "include": "$self"
            }
          ]
        },
        "interface_variables_types": {
          "begin": "\\b(interface)\\b\\s*(\\{)",
          "beginCaptures": {
            "1": {
              "name": "keyword.interface.go"
            },
            "2": {
              "name": "punctuation.definition.begin.bracket.curly.go"
            }
          },
          "end": "}",
          "endCaptures": {
            "0": {
              "name": "punctuation.definition.end.bracket.curly.go"
            }
          },
          "patterns": [
            {
              "include": "#interface_variables_types_field"
            },
            {
              "include": "$self"
            }
          ]
        },
        "interface_variables_types_field": {
          "patterns": [
            {
              "include": "#support_functions"
            },
            {
              "include": "#type-declarations-without-brackets"
            },
            {
              "begin": "([*.\\w]+)?(\\[)",
              "beginCaptures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                },
                "2": {
                  "name": "punctuation.definition.begin.bracket.square.go"
                }
              },
              "end": "]",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.square.go"
                }
              },
              "patterns": [
                {
                  "include": "#generic_param_types"
                }
              ]
            },
            {
              "begin": "\\(",
              "beginCaptures": {
                "0": {
                  "name": "punctuation.definition.begin.bracket.round.go"
                }
              },
              "end": "\\)",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.round.go"
                }
              },
              "patterns": [
                {
                  "include": "#function_param_types"
                }
              ]
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "([.\\w]+)"
            }
          ]
        },
        "keywords": {
          "patterns": [
            {
              "match": "\\b(break|case|continue|default|defer|else|fallthrough|for|go|goto|if|range|return|select|switch)\\b",
              "name": "keyword.control.go"
            },
            {
              "match": "\\bchan\\b",
              "name": "keyword.channel.go"
            },
            {
              "match": "\\bconst\\b",
              "name": "keyword.const.go"
            },
            {
              "match": "\\bvar\\b",
              "name": "keyword.var.go"
            },
            {
              "match": "\\bfunc\\b",
              "name": "keyword.function.go"
            },
            {
              "match": "\\binterface\\b",
              "name": "keyword.interface.go"
            },
            {
              "match": "\\bmap\\b",
              "name": "keyword.map.go"
            },
            {
              "match": "\\bstruct\\b",
              "name": "keyword.struct.go"
            },
            {
              "match": "\\bimport\\b",
              "name": "keyword.control.import.go"
            },
            {
              "match": "\\btype\\b",
              "name": "keyword.type.go"
            }
          ]
        },
        "label_loop_variables": {
          "captures": {
            "1": {
              "patterns": [
                {
                  "include": "#type-declarations"
                },
                {
                  "match": "\\w+",
                  "name": "variable.other.label.go"
                }
              ]
            }
          },
          "match": "^(\\s*\\w+:\\s*|\\s*\\b(?:break|goto|continue)\\b\\s+\\w+(?:\\s*/[*/]\\s*.*)?)$"
        },
        "language_constants": {
          "captures": {
            "1": {
              "name": "constant.language.boolean.go"
            },
            "2": {
              "name": "constant.language.null.go"
            },
            "3": {
              "name": "constant.language.iota.go"
            }
          },
          "match": "\\b(?:(true|false)|(nil)|(iota))\\b"
        },
        "map_types": {
          "begin": "\\b(map)\\b(\\[)",
          "beginCaptures": {
            "1": {
              "name": "keyword.map.go"
            },
            "2": {
              "name": "punctuation.definition.begin.bracket.square.go"
            }
          },
          "end": "(])((?:[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}(?![]*\\[]+{0,1}\\b(?:func|struct|map)\\b)[]*\\[]+{0,1}[.\\w]+(?:\\[(?:[]*.\\[{}\\w]+(?:,\\s*[]*.\\[{}\\w]+)*)?])?)?",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.end.bracket.square.go"
            },
            "2": {
              "patterns": [
                {
                  "include": "#type-declarations-without-brackets"
                },
                {
                  "match": "\\[",
                  "name": "punctuation.definition.begin.bracket.square.go"
                },
                {
                  "match": "]",
                  "name": "punctuation.definition.end.bracket.square.go"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.type.go"
                }
              ]
            }
          },
          "patterns": [
            {
              "include": "#type-declarations-without-brackets"
            },
            {
              "include": "#parameter-variable-types"
            },
            {
              "include": "#functions"
            },
            {
              "match": "\\[",
              "name": "punctuation.definition.begin.bracket.square.go"
            },
            {
              "match": "]",
              "name": "punctuation.definition.end.bracket.square.go"
            },
            {
              "match": "\\{",
              "name": "punctuation.definition.begin.bracket.curly.go"
            },
            {
              "match": "}",
              "name": "punctuation.definition.end.bracket.curly.go"
            },
            {
              "match": "\\(",
              "name": "punctuation.definition.begin.bracket.round.go"
            },
            {
              "match": "\\)",
              "name": "punctuation.definition.end.bracket.round.go"
            },
            {
              "match": "\\w+",
              "name": "entity.name.type.go"
            }
          ]
        },
        "multi_types": {
          "begin": "\\b(type)\\b\\s*(\\()",
          "beginCaptures": {
            "1": {
              "name": "keyword.type.go"
            },
            "2": {
              "name": "punctuation.definition.begin.bracket.round.go"
            }
          },
          "end": "\\)",
          "endCaptures": {
            "0": {
              "name": "punctuation.definition.end.bracket.round.go"
            }
          },
          "patterns": [
            {
              "include": "#struct_variables_types"
            },
            {
              "include": "#interface_variables_types"
            },
            {
              "include": "#type-declarations-without-brackets"
            },
            {
              "include": "#parameter-variable-types"
            },
            {
              "match": "\\w+",
              "name": "entity.name.type.go"
            }
          ]
        },
        "numeric_literals": {
          "captures": {
            "0": {
              "patterns": [
                {
                  "begin": "(?=.)",
                  "end": "\\n|$",
                  "patterns": [
                    {
                      "captures": {
                        "1": {
                          "name": "constant.numeric.decimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "2": {
                          "name": "punctuation.separator.constant.numeric.go"
                        },
                        "3": {
                          "name": "constant.numeric.decimal.point.go"
                        },
                        "4": {
                          "name": "constant.numeric.decimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "5": {
                          "name": "punctuation.separator.constant.numeric.go"
                        },
                        "6": {
                          "name": "keyword.other.unit.exponent.decimal.go"
                        },
                        "7": {
                          "name": "keyword.operator.plus.exponent.decimal.go"
                        },
                        "8": {
                          "name": "keyword.operator.minus.exponent.decimal.go"
                        },
                        "9": {
                          "name": "constant.numeric.exponent.decimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "10": {
                          "name": "keyword.other.unit.imaginary.go"
                        },
                        "11": {
                          "name": "constant.numeric.decimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "12": {
                          "name": "punctuation.separator.constant.numeric.go"
                        },
                        "13": {
                          "name": "keyword.other.unit.exponent.decimal.go"
                        },
                        "14": {
                          "name": "keyword.operator.plus.exponent.decimal.go"
                        },
                        "15": {
                          "name": "keyword.operator.minus.exponent.decimal.go"
                        },
                        "16": {
                          "name": "constant.numeric.exponent.decimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "17": {
                          "name": "keyword.other.unit.imaginary.go"
                        },
                        "18": {
                          "name": "constant.numeric.decimal.point.go"
                        },
                        "19": {
                          "name": "constant.numeric.decimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "20": {
                          "name": "punctuation.separator.constant.numeric.go"
                        },
                        "21": {
                          "name": "keyword.other.unit.exponent.decimal.go"
                        },
                        "22": {
                          "name": "keyword.operator.plus.exponent.decimal.go"
                        },
                        "23": {
                          "name": "keyword.operator.minus.exponent.decimal.go"
                        },
                        "24": {
                          "name": "constant.numeric.exponent.decimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "25": {
                          "name": "keyword.other.unit.imaginary.go"
                        },
                        "26": {
                          "name": "keyword.other.unit.hexadecimal.go"
                        },
                        "27": {
                          "name": "constant.numeric.hexadecimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "28": {
                          "name": "punctuation.separator.constant.numeric.go"
                        },
                        "29": {
                          "name": "constant.numeric.hexadecimal.go"
                        },
                        "30": {
                          "name": "constant.numeric.hexadecimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "31": {
                          "name": "punctuation.separator.constant.numeric.go"
                        },
                        "32": {
                          "name": "keyword.other.unit.exponent.hexadecimal.go"
                        },
                        "33": {
                          "name": "keyword.operator.plus.exponent.hexadecimal.go"
                        },
                        "34": {
                          "name": "keyword.operator.minus.exponent.hexadecimal.go"
                        },
                        "35": {
                          "name": "constant.numeric.exponent.hexadecimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "36": {
                          "name": "keyword.other.unit.imaginary.go"
                        },
                        "37": {
                          "name": "keyword.other.unit.hexadecimal.go"
                        },
                        "38": {
                          "name": "constant.numeric.hexadecimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "39": {
                          "name": "punctuation.separator.constant.numeric.go"
                        },
                        "40": {
                          "name": "keyword.other.unit.exponent.hexadecimal.go"
                        },
                        "41": {
                          "name": "keyword.operator.plus.exponent.hexadecimal.go"
                        },
                        "42": {
                          "name": "keyword.operator.minus.exponent.hexadecimal.go"
                        },
                        "43": {
                          "name": "constant.numeric.exponent.hexadecimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "44": {
                          "name": "keyword.other.unit.imaginary.go"
                        },
                        "45": {
                          "name": "keyword.other.unit.hexadecimal.go"
                        },
                        "46": {
                          "name": "constant.numeric.hexadecimal.go"
                        },
                        "47": {
                          "name": "constant.numeric.hexadecimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "48": {
                          "name": "punctuation.separator.constant.numeric.go"
                        },
                        "49": {
                          "name": "keyword.other.unit.exponent.hexadecimal.go"
                        },
                        "50": {
                          "name": "keyword.operator.plus.exponent.hexadecimal.go"
                        },
                        "51": {
                          "name": "keyword.operator.minus.exponent.hexadecimal.go"
                        },
                        "52": {
                          "name": "constant.numeric.exponent.hexadecimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "53": {
                          "name": "keyword.other.unit.imaginary.go"
                        }
                      },
                      "match": "\\G(?:(?:(?:(?:(?:(?=[.0-9])(?!0[BOXbox])([0-9](?:[0-9]|((?<=\\h)_(?=\\h)))*)((?<=[0-9])\\.|\\.(?=[0-9]))([0-9](?:[0-9]|((?<=\\h)_(?=\\h)))*)?(?:(?<!_)([Ee])(\\+?)(-?)([0-9](?:[0-9]|(?<=\\h)_(?=\\h))*))?(i(?!\\w))?(?:\\n|$)|(?=[.0-9])(?!0[BOXbox])([0-9](?:[0-9]|((?<=\\h)_(?=\\h)))*)(?<!_)([Ee])(\\+?)(-?)([0-9](?:[0-9]|(?<=\\h)_(?=\\h))*)(i(?!\\w))?(?:\\n|$))|((?<=[0-9])\\.|\\.(?=[0-9]))([0-9](?:[0-9]|((?<=\\h)_(?=\\h)))*)(?:(?<!_)([Ee])(\\+?)(-?)([0-9](?:[0-9]|(?<=\\h)_(?=\\h))*))?(i(?!\\w))?(?:\\n|$))|(0[Xx])_?(\\h(?:\\h|((?<=\\h)_(?=\\h)))*)((?<=\\h)\\.|\\.(?=\\h))(\\h(?:\\h|((?<=\\h)_(?=\\h)))*)?(?<!_)([Pp])(\\+?)(-?)([0-9](?:[0-9]|(?<=\\h)_(?=\\h))*)(i(?!\\w))?(?:\\n|$))|(0[Xx])_?(\\h(?:\\h|((?<=\\h)_(?=\\h)))*)(?<!_)([Pp])(\\+?)(-?)([0-9](?:[0-9]|(?<=\\h)_(?=\\h))*)(i(?!\\w))?(?:\\n|$))|(0[Xx])((?<=\\h)\\.|\\.(?=\\h))(\\h(?:\\h|((?<=\\h)_(?=\\h)))*)(?<!_)([Pp])(\\+?)(-?)([0-9](?:[0-9]|(?<=\\h)_(?=\\h))*)(i(?!\\w))?(?:\\n|$))"
                    },
                    {
                      "captures": {
                        "1": {
                          "name": "constant.numeric.decimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "2": {
                          "name": "punctuation.separator.constant.numeric.go"
                        },
                        "3": {
                          "name": "keyword.other.unit.imaginary.go"
                        },
                        "4": {
                          "name": "keyword.other.unit.binary.go"
                        },
                        "5": {
                          "name": "constant.numeric.binary.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "6": {
                          "name": "punctuation.separator.constant.numeric.go"
                        },
                        "7": {
                          "name": "keyword.other.unit.imaginary.go"
                        },
                        "8": {
                          "name": "keyword.other.unit.octal.go"
                        },
                        "9": {
                          "name": "constant.numeric.octal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "10": {
                          "name": "punctuation.separator.constant.numeric.go"
                        },
                        "11": {
                          "name": "keyword.other.unit.imaginary.go"
                        },
                        "12": {
                          "name": "keyword.other.unit.hexadecimal.go"
                        },
                        "13": {
                          "name": "constant.numeric.hexadecimal.go",
                          "patterns": [
                            {
                              "match": "(?<=\\h)_(?=\\h)",
                              "name": "punctuation.separator.constant.numeric.go"
                            }
                          ]
                        },
                        "14": {
                          "name": "punctuation.separator.constant.numeric.go"
                        },
                        "15": {
                          "name": "keyword.other.unit.imaginary.go"
                        }
                      },
                      "match": "\\G(?:(?:(?:(?=[.0-9])(?!0[BOXbox])([0-9](?:[0-9]|((?<=\\h)_(?=\\h)))*)(i(?!\\w))?(?:\\n|$)|(0[Bb])_?([01](?:[01]|((?<=\\h)_(?=\\h)))*)(i(?!\\w))?(?:\\n|$))|(0[Oo]?)_?((?:[0-7]|((?<=\\h)_(?=\\h)))+)(i(?!\\w))?(?:\\n|$))|(0[Xx])_?(\\h(?:\\h|((?<=\\h)_(?=\\h)))*)(i(?!\\w))?(?:\\n|$))"
                    },
                    {
                      "match": "(?:[.0-9A-Z_a-z]|(?<=[EPep])[-+])+",
                      "name": "invalid.illegal.constant.numeric.go"
                    }
                  ]
                }
              ]
            }
          },
          "match": "(?<!\\w)\\.?\\d(?:[.0-9A-Z_a-z]|(?<=[EPep])[-+])*"
        },
        "operators": {
          "patterns": [
            {
              "match": "(?<!\\w)[\\&*]+(?!\\d)(?=[]\\[\\w]|<-)",
              "name": "keyword.operator.address.go"
            },
            {
              "match": "<-",
              "name": "keyword.operator.channel.go"
            },
            {
              "match": "--",
              "name": "keyword.operator.decrement.go"
            },
            {
              "match": "\\+\\+",
              "name": "keyword.operator.increment.go"
            },
            {
              "match": "(==|!=|<=|>=|<(?!<)|>(?!>))",
              "name": "keyword.operator.comparison.go"
            },
            {
              "match": "(&&|\\|\\||!)",
              "name": "keyword.operator.logical.go"
            },
            {
              "match": "((?:|[-%*+/:^|]|<<|>>|&\\^?)=)",
              "name": "keyword.operator.assignment.go"
            },
            {
              "match": "([-%*+/])",
              "name": "keyword.operator.arithmetic.go"
            },
            {
              "match": "(&(?!\\^)|[\\^|]|&\\^|<<|>>|~)",
              "name": "keyword.operator.arithmetic.bitwise.go"
            },
            {
              "match": "\\.\\.\\.",
              "name": "keyword.operator.ellipsis.go"
            }
          ]
        },
        "other_struct_interface_expressions": {
          "patterns": [
            {
              "include": "#after_control_variables"
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                },
                "2": {
                  "patterns": [
                    {
                      "include": "#type-declarations-without-brackets"
                    },
                    {
                      "match": "\\[",
                      "name": "punctuation.definition.begin.bracket.square.go"
                    },
                    {
                      "match": "]",
                      "name": "punctuation.definition.end.bracket.square.go"
                    },
                    {
                      "match": "\\{",
                      "name": "punctuation.definition.begin.bracket.curly.go"
                    },
                    {
                      "match": "}",
                      "name": "punctuation.definition.end.bracket.curly.go"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "\\b(?!(?:struct|interface)\\b)([.\\w]+)(?<brackets>\\[(?:[^]\\[]|\\g<brackets>)*])?(?=\\{)"
            }
          ]
        },
        "other_variables": {
          "match": "\\w+",
          "name": "variable.other.go"
        },
        "package_name": {
          "patterns": [
            {
              "begin": "\\b(package)\\s+",
              "beginCaptures": {
                "1": {
                  "name": "keyword.package.go"
                }
              },
              "end": "(?!\\G)",
              "patterns": [
                {
                  "match": "\\d\\w*",
                  "name": "invalid.illegal.identifier.go"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.type.package.go"
                }
              ]
            }
          ]
        },
        "parameter-variable-types": {
          "patterns": [
            {
              "match": "\\{",
              "name": "punctuation.definition.begin.bracket.curly.go"
            },
            {
              "match": "}",
              "name": "punctuation.definition.end.bracket.curly.go"
            },
            {
              "begin": "([*.\\w]+)?(\\[)",
              "beginCaptures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                },
                "2": {
                  "name": "punctuation.definition.begin.bracket.square.go"
                }
              },
              "end": "]",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.square.go"
                }
              },
              "patterns": [
                {
                  "include": "#generic_param_types"
                }
              ]
            },
            {
              "begin": "\\(",
              "beginCaptures": {
                "0": {
                  "name": "punctuation.definition.begin.bracket.round.go"
                }
              },
              "end": "\\)",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.round.go"
                }
              },
              "patterns": [
                {
                  "include": "#function_param_types"
                }
              ]
            }
          ]
        },
        "property_variables": {
          "captures": {
            "1": {
              "patterns": [
                {
                  "include": "#type-declarations"
                },
                {
                  "match": "\\w+",
                  "name": "variable.other.property.go"
                }
              ]
            }
          },
          "match": "\\b([.\\w]+:(?!=))"
        },
        "raw_string_literals": {
          "begin": "`",
          "beginCaptures": {
            "0": {
              "name": "punctuation.definition.string.begin.go"
            }
          },
          "end": "`",
          "endCaptures": {
            "0": {
              "name": "punctuation.definition.string.end.go"
            }
          },
          "name": "string.quoted.raw.go",
          "patterns": [
            {
              "include": "#string_placeholder"
            }
          ]
        },
        "runes": {
          "patterns": [
            {
              "begin": "'",
              "beginCaptures": {
                "0": {
                  "name": "punctuation.definition.string.begin.go"
                }
              },
              "end": "'",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.string.end.go"
                }
              },
              "name": "string.quoted.rune.go",
              "patterns": [
                {
                  "match": "\\G(\\\\([0-7]{3}|[\"'\\\\abfnrtv]|x\\h{2}|u\\h{4}|U\\h{8})|.)(?=')",
                  "name": "constant.other.rune.go"
                },
                {
                  "match": "[^']+",
                  "name": "invalid.illegal.unknown-rune.go"
                }
              ]
            }
          ]
        },
        "single_type": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "name": "keyword.type.go"
                },
                "2": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                },
                "3": {
                  "patterns": [
                    {
                      "begin": "\\(",
                      "beginCaptures": {
                        "0": {
                          "name": "punctuation.definition.begin.bracket.round.go"
                        }
                      },
                      "end": "\\)",
                      "endCaptures": {
                        "0": {
                          "name": "punctuation.definition.end.bracket.round.go"
                        }
                      },
                      "patterns": [
                        {
                          "include": "#function_param_types"
                        },
                        {
                          "include": "$self"
                        }
                      ]
                    },
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "include": "#generic_types"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "^\\s*\\b(type)\\b\\s*([*.\\w]+)\\s+(?!(?:=\\s*)?[]*\\[]+{0,1}\\b(?:struct|interface)\\b)([\\s\\S]+)"
            },
            {
              "begin": "(?:^|\\s+)\\b(type)\\b\\s*([*.\\w]+)(?=\\[)",
              "beginCaptures": {
                "1": {
                  "name": "keyword.type.go"
                },
                "2": {
                  "patterns": [
                    {
                      "include": "#type-declarations-without-brackets"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "end": "(?<=])(\\s+(?:=\\s*)?(?:[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}(?![]*\\[]+{0,1}\\b(?:struct|interface|func)\\b)[-\\]*.\\[\\w]+(?:,\\s*[]*.\\[\\w]+)*)?",
              "endCaptures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations-without-brackets"
                    },
                    {
                      "match": "\\[",
                      "name": "punctuation.definition.begin.bracket.square.go"
                    },
                    {
                      "match": "]",
                      "name": "punctuation.definition.end.bracket.square.go"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "patterns": [
                {
                  "include": "#struct_variables_types"
                },
                {
                  "include": "#type-declarations-without-brackets"
                },
                {
                  "include": "#parameter-variable-types"
                },
                {
                  "match": "\\[",
                  "name": "punctuation.definition.begin.bracket.square.go"
                },
                {
                  "match": "]",
                  "name": "punctuation.definition.end.bracket.square.go"
                },
                {
                  "match": "\\{",
                  "name": "punctuation.definition.begin.bracket.curly.go"
                },
                {
                  "match": "}",
                  "name": "punctuation.definition.end.bracket.curly.go"
                },
                {
                  "match": "\\(",
                  "name": "punctuation.definition.begin.bracket.round.go"
                },
                {
                  "match": "\\)",
                  "name": "punctuation.definition.end.bracket.round.go"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.type.go"
                }
              ]
            }
          ]
        },
        "slice_index_variables": {
          "captures": {
            "1": {
              "patterns": [
                {
                  "include": "#type-declarations"
                },
                {
                  "match": "\\w+",
                  "name": "variable.other.go"
                }
              ]
            }
          },
          "match": "(?<=\\w\\[)((?:\\b[-%\\&*+./<>|\\w]+:|:\\b[-%\\&*+./<>|\\w]+)(?:\\b[-%\\&*+./<>|\\w]+)?(?::\\b[-%\\&*+./<>|\\w]+)?)(?=])"
        },
        "statements": {
          "patterns": [
            {
              "include": "#package_name"
            },
            {
              "include": "#import"
            },
            {
              "include": "#syntax_errors"
            },
            {
              "include": "#group-functions"
            },
            {
              "include": "#group-types"
            },
            {
              "include": "#group-variables"
            },
            {
              "include": "#hover"
            }
          ]
        },
        "storage_types": {
          "patterns": [
            {
              "match": "\\bbool\\b",
              "name": "storage.type.boolean.go"
            },
            {
              "match": "\\bbyte\\b",
              "name": "storage.type.byte.go"
            },
            {
              "match": "\\berror\\b",
              "name": "storage.type.error.go"
            },
            {
              "match": "\\b(complex(64|128)|float(32|64)|u?int(8|16|32|64)?)\\b",
              "name": "storage.type.numeric.go"
            },
            {
              "match": "\\brune\\b",
              "name": "storage.type.rune.go"
            },
            {
              "match": "\\bstring\\b",
              "name": "storage.type.string.go"
            },
            {
              "match": "\\buintptr\\b",
              "name": "storage.type.uintptr.go"
            },
            {
              "match": "\\bany\\b",
              "name": "entity.name.type.any.go"
            },
            {
              "match": "\\bcomparable\\b",
              "name": "entity.name.type.comparable.go"
            }
          ]
        },
        "string_escaped_char": {
          "patterns": [
            {
              "match": "\\\\([0-7]{3}|[\"'\\\\abfnrtv]|x\\h{2}|u\\h{4}|U\\h{8})",
              "name": "constant.character.escape.go"
            },
            {
              "match": "\\\\[^\"'0-7Uabfnrtuvx]",
              "name": "invalid.illegal.unknown-escape.go"
            }
          ]
        },
        "string_literals": {
          "patterns": [
            {
              "begin": "\"",
              "beginCaptures": {
                "0": {
                  "name": "punctuation.definition.string.begin.go"
                }
              },
              "end": "\"",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.string.end.go"
                }
              },
              "name": "string.quoted.double.go",
              "patterns": [
                {
                  "include": "#string_escaped_char"
                },
                {
                  "include": "#string_placeholder"
                }
              ]
            }
          ]
        },
        "string_placeholder": {
          "patterns": [
            {
              "match": "%(\\[\\d+])?([- #+0]{0,2}((\\d+|\\*)?(\\.?(\\d+|\\*|(\\[\\d+])\\*?)?(\\[\\d+])?)?))?[%EFGTUXb-gopqstvwx]",
              "name": "constant.other.placeholder.go"
            }
          ]
        },
        "struct_interface_declaration": {
          "captures": {
            "1": {
              "name": "keyword.type.go"
            },
            "2": {
              "patterns": [
                {
                  "include": "#type-declarations"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.type.go"
                }
              ]
            }
          },
          "match": "^\\s*\\b(type)\\b\\s*([.\\w]+)"
        },
        "struct_variable_types_fields_multi": {
          "patterns": [
            {
              "begin": "\\b(\\w+(?:,\\s*\\b\\w+)*(?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}\\s*[]*\\[]+{0,1})\\b(struct)\\b\\s*(\\{)",
              "beginCaptures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.other.property.go"
                    }
                  ]
                },
                "2": {
                  "name": "keyword.struct.go"
                },
                "3": {
                  "name": "punctuation.definition.begin.bracket.curly.go"
                }
              },
              "end": "}",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.curly.go"
                }
              },
              "patterns": [
                {
                  "include": "#struct_variables_types_fields"
                },
                {
                  "include": "$self"
                }
              ]
            },
            {
              "begin": "\\b(\\w+(?:,\\s*\\b\\w+)*(?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}\\s*[]*\\[]+{0,1})\\b(interface)\\b\\s*(\\{)",
              "beginCaptures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.other.property.go"
                    }
                  ]
                },
                "2": {
                  "name": "keyword.interface.go"
                },
                "3": {
                  "name": "punctuation.definition.begin.bracket.curly.go"
                }
              },
              "end": "}",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.curly.go"
                }
              },
              "patterns": [
                {
                  "include": "#interface_variables_types_field"
                },
                {
                  "include": "$self"
                }
              ]
            },
            {
              "begin": "\\b(\\w+(?:,\\s*\\b\\w+)*(?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}\\s*[]*\\[]+{0,1})\\b(func)\\b\\s*(\\()",
              "beginCaptures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.other.property.go"
                    }
                  ]
                },
                "2": {
                  "name": "keyword.function.go"
                },
                "3": {
                  "name": "punctuation.definition.begin.bracket.round.go"
                }
              },
              "end": "\\)",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.round.go"
                }
              },
              "patterns": [
                {
                  "include": "#function_param_types"
                },
                {
                  "include": "$self"
                }
              ]
            },
            {
              "include": "#parameter-variable-types"
            }
          ]
        },
        "struct_variables_types": {
          "begin": "\\b(struct)\\b\\s*(\\{)",
          "beginCaptures": {
            "1": {
              "name": "keyword.struct.go"
            },
            "2": {
              "name": "punctuation.definition.begin.bracket.curly.go"
            }
          },
          "end": "}",
          "endCaptures": {
            "0": {
              "name": "punctuation.definition.end.bracket.curly.go"
            }
          },
          "patterns": [
            {
              "include": "#struct_variables_types_fields"
            },
            {
              "include": "$self"
            }
          ]
        },
        "struct_variables_types_fields": {
          "patterns": [
            {
              "include": "#struct_variable_types_fields_multi"
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "(?<=\\{)\\s*((?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}[]*.\\[\\w]+)\\s*(?=})"
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.other.property.go"
                    }
                  ]
                },
                "2": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "(?<=\\{)\\s*((?:\\w+,\\s*)+{0,1}\\w+\\s+)((?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}[]*.\\[\\w]+)\\s*(?=})"
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "captures": {
                        "1": {
                          "patterns": [
                            {
                              "include": "#type-declarations"
                            },
                            {
                              "match": "\\w+",
                              "name": "variable.other.property.go"
                            }
                          ]
                        },
                        "2": {
                          "patterns": [
                            {
                              "include": "#type-declarations"
                            },
                            {
                              "match": "\\w+",
                              "name": "entity.name.type.go"
                            }
                          ]
                        }
                      },
                      "match": "((?:\\w+,\\s*)+{0,1}\\w+\\s+)?((?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}[^/\\s]+;?)"
                    }
                  ]
                }
              },
              "match": "(?<=\\{)((?:\\s*(?:(?:\\w+,\\s*)+{0,1}\\w+\\s+)?(?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}[^/\\s]+;?)+)\\s*(?=})"
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "((?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}[*.\\w]+\\s*)(?:(?=[\"/`])|$)"
            },
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.other.property.go"
                    }
                  ]
                },
                "2": {
                  "patterns": [
                    {
                      "include": "#type-declarations-without-brackets"
                    },
                    {
                      "include": "#parameter-variable-types"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "\\b(\\w+(?:\\s*,\\s*\\b\\w+)*)\\s*([^\"/`]+)"
            }
          ]
        },
        "support_functions": {
          "captures": {
            "1": {
              "name": "entity.name.function.support.go"
            },
            "2": {
              "patterns": [
                {
                  "include": "#type-declarations"
                },
                {
                  "match": "\\d\\w*",
                  "name": "invalid.illegal.identifier.go"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.function.support.go"
                }
              ]
            },
            "3": {
              "patterns": [
                {
                  "include": "#type-declarations-without-brackets"
                },
                {
                  "match": "\\[",
                  "name": "punctuation.definition.begin.bracket.square.go"
                },
                {
                  "match": "]",
                  "name": "punctuation.definition.end.bracket.square.go"
                },
                {
                  "match": "\\{",
                  "name": "punctuation.definition.begin.bracket.curly.go"
                },
                {
                  "match": "}",
                  "name": "punctuation.definition.end.bracket.curly.go"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.type.go"
                }
              ]
            }
          },
          "match": "(?:((?<=\\.)\\b\\w+)|\\b(\\w+))(?<brackets>\\[(?:[^]\\[]|\\g<brackets>)*])?(?=\\()"
        },
        "switch_types": {
          "begin": "(?<=\\bswitch\\b)\\s*(\\w+\\s*:=)?\\s*([-\\]%\\&(-+./<>\\[|\\w]+)(\\.\\(\\btype\\b\\)\\s*)(\\{)",
          "beginCaptures": {
            "1": {
              "patterns": [
                {
                  "include": "#operators"
                },
                {
                  "match": "\\w+",
                  "name": "variable.other.assignment.go"
                }
              ]
            },
            "2": {
              "patterns": [
                {
                  "include": "#support_functions"
                },
                {
                  "include": "#type-declarations"
                },
                {
                  "match": "\\w+",
                  "name": "variable.other.go"
                }
              ]
            },
            "3": {
              "patterns": [
                {
                  "include": "#delimiters"
                },
                {
                  "include": "#brackets"
                },
                {
                  "match": "\\btype\\b",
                  "name": "keyword.type.go"
                }
              ]
            },
            "4": {
              "name": "punctuation.definition.begin.bracket.curly.go"
            }
          },
          "end": "}",
          "endCaptures": {
            "0": {
              "name": "punctuation.definition.end.bracket.curly.go"
            }
          },
          "patterns": [
            {
              "captures": {
                "1": {
                  "name": "keyword.control.go"
                },
                "2": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                },
                "3": {
                  "name": "punctuation.other.colon.go"
                },
                "4": {
                  "patterns": [
                    {
                      "include": "#comments"
                    }
                  ]
                }
              },
              "match": "^\\s*\\b(case)\\b\\s+([!*,.<=>\\w\\s]+)(:)(\\s*/[*/]\\s*.*)?$"
            },
            {
              "begin": "\\bcase\\b",
              "beginCaptures": {
                "0": {
                  "name": "keyword.control.go"
                }
              },
              "end": ":",
              "endCaptures": {
                "0": {
                  "name": "punctuation.other.colon.go"
                }
              },
              "patterns": [
                {
                  "include": "#type-declarations"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.type.go"
                }
              ]
            },
            {
              "include": "$self"
            }
          ]
        },
        "switch_variables": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "name": "keyword.control.go"
                },
                "2": {
                  "patterns": [
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "include": "#support_functions"
                    },
                    {
                      "include": "#variable_assignment"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.other.go"
                    }
                  ]
                }
              },
              "match": "^\\s*\\b(case)\\b\\s+([\\s\\S]+:\\s*(?:/[*/].*)?)$"
            },
            {
              "begin": "(?<=\\bswitch\\b)\\s*((?:[.\\w]+(?:\\s*[-!%\\&+,/:<=>|]+\\s*[.\\w]+)*\\s*[-!%\\&+,/:<=>|]+)?\\s*[-\\]%\\&(-+./<>\\[|\\w]+{0,1}\\s*(?:;\\s*[-\\]%\\&(-+./<>\\[|\\w]+\\s*)?)(\\{)",
              "beginCaptures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#support_functions"
                    },
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "include": "#variable_assignment"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.other.go"
                    }
                  ]
                },
                "2": {
                  "name": "punctuation.definition.begin.bracket.curly.go"
                }
              },
              "end": "}",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.curly.go"
                }
              },
              "patterns": [
                {
                  "begin": "\\bcase\\b",
                  "beginCaptures": {
                    "0": {
                      "name": "keyword.control.go"
                    }
                  },
                  "end": ":",
                  "endCaptures": {
                    "0": {
                      "name": "punctuation.other.colon.go"
                    }
                  },
                  "patterns": [
                    {
                      "include": "#support_functions"
                    },
                    {
                      "include": "#type-declarations"
                    },
                    {
                      "include": "#variable_assignment"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.other.go"
                    }
                  ]
                },
                {
                  "include": "$self"
                }
              ]
            }
          ]
        },
        "syntax_errors": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "name": "invalid.illegal.slice.go"
                }
              },
              "match": "\\[](\\s+)"
            },
            {
              "match": "\\b0[0-7]*[89]\\d*\\b",
              "name": "invalid.illegal.numeric.go"
            }
          ]
        },
        "terminators": {
          "match": ";",
          "name": "punctuation.terminator.go"
        },
        "type-declarations": {
          "patterns": [
            {
              "include": "#language_constants"
            },
            {
              "include": "#comments"
            },
            {
              "include": "#map_types"
            },
            {
              "include": "#brackets"
            },
            {
              "include": "#delimiters"
            },
            {
              "include": "#keywords"
            },
            {
              "include": "#operators"
            },
            {
              "include": "#runes"
            },
            {
              "include": "#storage_types"
            },
            {
              "include": "#raw_string_literals"
            },
            {
              "include": "#string_literals"
            },
            {
              "include": "#numeric_literals"
            },
            {
              "include": "#terminators"
            }
          ]
        },
        "type-declarations-without-brackets": {
          "patterns": [
            {
              "include": "#language_constants"
            },
            {
              "include": "#comments"
            },
            {
              "include": "#map_types"
            },
            {
              "include": "#delimiters"
            },
            {
              "include": "#keywords"
            },
            {
              "include": "#operators"
            },
            {
              "include": "#runes"
            },
            {
              "include": "#storage_types"
            },
            {
              "include": "#raw_string_literals"
            },
            {
              "include": "#string_literals"
            },
            {
              "include": "#numeric_literals"
            },
            {
              "include": "#terminators"
            }
          ]
        },
        "type_assertion_inline": {
          "captures": {
            "1": {
              "name": "keyword.type.go"
            },
            "2": {
              "patterns": [
                {
                  "include": "#type-declarations-without-brackets"
                },
                {
                  "match": "\\(",
                  "name": "punctuation.definition.begin.bracket.round.go"
                },
                {
                  "match": "\\)",
                  "name": "punctuation.definition.end.bracket.round.go"
                },
                {
                  "match": "\\[",
                  "name": "punctuation.definition.begin.bracket.square.go"
                },
                {
                  "match": "]",
                  "name": "punctuation.definition.end.bracket.square.go"
                },
                {
                  "match": "\\{",
                  "name": "punctuation.definition.begin.bracket.curly.go"
                },
                {
                  "match": "}",
                  "name": "punctuation.definition.end.bracket.curly.go"
                },
                {
                  "match": "\\w+",
                  "name": "entity.name.type.go"
                }
              ]
            }
          },
          "match": "(?<=\\.\\()(?:\\b(type)\\b|((?:\\s*[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+{0,1}[]*\\[]+{0,1}[.\\w]+(?:\\[(?:[]*.\\[{}\\w]+(?:,\\s*[]*.\\[{}\\w]+)*)?])?))(?=\\))"
        },
        "var_assignment": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "patterns": [
                    {
                      "include": "#delimiters"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.other.assignment.go"
                    }
                  ]
                },
                "2": {
                  "patterns": [
                    {
                      "include": "#type-declarations-without-brackets"
                    },
                    {
                      "include": "#generic_types"
                    },
                    {
                      "match": "\\(",
                      "name": "punctuation.definition.begin.bracket.round.go"
                    },
                    {
                      "match": "\\)",
                      "name": "punctuation.definition.end.bracket.round.go"
                    },
                    {
                      "match": "\\[",
                      "name": "punctuation.definition.begin.bracket.square.go"
                    },
                    {
                      "match": "]",
                      "name": "punctuation.definition.end.bracket.square.go"
                    },
                    {
                      "match": "\\w+",
                      "name": "entity.name.type.go"
                    }
                  ]
                }
              },
              "match": "(?<=\\bvar\\b)\\s*\\b([.\\w]+(?:,\\s*[.\\w]+)*)\\s*((?:(?:[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+(?:\\([^)]+\\))?)?(?![]*\\[]+{0,1}\\b(?:struct|func|map)\\b)(?:[]*.\\[\\w]+(?:,\\s*[]*.\\[\\w]+)*)?\\s*=?)?"
            },
            {
              "begin": "(?<=\\bvar\\b)\\s*(\\()",
              "beginCaptures": {
                "1": {
                  "name": "punctuation.definition.begin.bracket.round.go"
                }
              },
              "end": "\\)",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.end.bracket.round.go"
                }
              },
              "patterns": [
                {
                  "captures": {
                    "1": {
                      "patterns": [
                        {
                          "include": "#delimiters"
                        },
                        {
                          "match": "\\w+",
                          "name": "variable.other.assignment.go"
                        }
                      ]
                    },
                    "2": {
                      "patterns": [
                        {
                          "include": "#type-declarations-without-brackets"
                        },
                        {
                          "include": "#generic_types"
                        },
                        {
                          "match": "\\(",
                          "name": "punctuation.definition.begin.bracket.round.go"
                        },
                        {
                          "match": "\\)",
                          "name": "punctuation.definition.end.bracket.round.go"
                        },
                        {
                          "match": "\\[",
                          "name": "punctuation.definition.begin.bracket.square.go"
                        },
                        {
                          "match": "]",
                          "name": "punctuation.definition.end.bracket.square.go"
                        },
                        {
                          "match": "\\w+",
                          "name": "entity.name.type.go"
                        }
                      ]
                    }
                  },
                  "match": "^\\s*\\b([.\\w]+(?:,\\s*[.\\w]+)*)\\s*((?:(?:[]*\\[]+{0,1}(?:<-\\s*)?\\bchan\\b(?:\\s*<-)?\\s*)+(?:\\([^)]+\\))?)?(?![]*\\[]+{0,1}\\b(?:struct|func|map)\\b)(?:[]*.\\[\\w]+(?:,\\s*[]*.\\[\\w]+)*)?\\s*=?)?"
                },
                {
                  "include": "$self"
                }
              ]
            }
          ]
        },
        "variable_assignment": {
          "patterns": [
            {
              "captures": {
                "0": {
                  "patterns": [
                    {
                      "include": "#delimiters"
                    },
                    {
                      "match": "\\d\\w*",
                      "name": "invalid.illegal.identifier.go"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.other.assignment.go"
                    }
                  ]
                }
              },
              "match": "\\b\\w+(?:,\\s*\\w+)*(?=\\s*:=)"
            },
            {
              "captures": {
                "0": {
                  "patterns": [
                    {
                      "include": "#delimiters"
                    },
                    {
                      "include": "#operators"
                    },
                    {
                      "match": "\\d\\w*",
                      "name": "invalid.illegal.identifier.go"
                    },
                    {
                      "match": "\\w+",
                      "name": "variable.other.assignment.go"
                    }
                  ]
                }
              },
              "match": "\\b[*.\\w]+(?:,\\s*[*.\\w]+)*(?=\\s*=(?!=))"
            }
          ]
        }
      },
      "scopeName": "source.go"
    },
    "rust": {
      "displayName": "Rust",
      "name": "rust",
      "patterns": [
        {
          "begin": "(<)(\\[)",
          "beginCaptures": {
            "1": {
              "name": "punctuation.brackets.angle.rust"
            },
            "2": {
              "name": "punctuation.brackets.square.rust"
            }
          },
          "end": ">",
          "endCaptures": {
            "0": {
              "name": "punctuation.brackets.angle.rust"
            }
          },
          "patterns": [
            {
              "include": "#block-comments"
            },
            {
              "include": "#comments"
            },
            {
              "include": "#gtypes"
            },
            {
              "include": "#lvariables"
            },
            {
              "include": "#lifetimes"
            },
            {
              "include": "#punctuation"
            },
            {
              "include": "#types"
            }
          ]
        },
        {
          "captures": {
            "1": {
              "name": "keyword.operator.macro.dollar.rust"
            },
            "3": {
              "name": "keyword.other.crate.rust"
            },
            "4": {
              "name": "entity.name.type.metavariable.rust"
            },
            "6": {
              "name": "keyword.operator.key-value.rust"
            },
            "7": {
              "name": "variable.other.metavariable.specifier.rust"
            }
          },
          "match": "(\\$)((crate)|([A-Z]\\w*))(\\s*(:)\\s*(block|expr(?:_2021)?|ident|item|lifetime|literal|meta|pat(?:_param)?|path|stmt|tt|ty|vis)\\b)?",
          "name": "meta.macro.metavariable.type.rust",
          "patterns": [
            {
              "include": "#keywords"
            }
          ]
        },
        {
          "captures": {
            "1": {
              "name": "keyword.operator.macro.dollar.rust"
            },
            "2": {
              "name": "variable.other.metavariable.name.rust"
            },
            "4": {
              "name": "keyword.operator.key-value.rust"
            },
            "5": {
              "name": "variable.other.metavariable.specifier.rust"
            }
          },
          "match": "(\\$)([a-z]\\w*)(\\s*(:)\\s*(block|expr(?:_2021)?|ident|item|lifetime|literal|meta|pat(?:_param)?|path|stmt|tt|ty|vis)\\b)?",
          "name": "meta.macro.metavariable.rust",
          "patterns": [
            {
              "include": "#keywords"
            }
          ]
        },
        {
          "captures": {
            "1": {
              "name": "entity.name.function.macro.rules.rust"
            },
            "3": {
              "name": "entity.name.function.macro.rust"
            },
            "4": {
              "name": "entity.name.type.macro.rust"
            },
            "5": {
              "name": "punctuation.brackets.curly.rust"
            }
          },
          "match": "\\b(macro_rules!)\\s+(([0-9_a-z]+)|([A-Z][0-9_a-z]*))\\s+(\\{)",
          "name": "meta.macro.rules.rust"
        },
        {
          "captures": {
            "1": {
              "name": "storage.type.rust"
            },
            "2": {
              "name": "entity.name.module.rust"
            }
          },
          "match": "(mod)\\s+((?:r#(?!crate|[Ss]elf|super))?[a-z][0-9A-Z_a-z]*)"
        },
        {
          "begin": "\\b(extern)\\s+(crate)",
          "beginCaptures": {
            "1": {
              "name": "storage.type.rust"
            },
            "2": {
              "name": "keyword.other.crate.rust"
            }
          },
          "end": ";",
          "endCaptures": {
            "0": {
              "name": "punctuation.semi.rust"
            }
          },
          "name": "meta.import.rust",
          "patterns": [
            {
              "include": "#block-comments"
            },
            {
              "include": "#comments"
            },
            {
              "include": "#keywords"
            },
            {
              "include": "#punctuation"
            }
          ]
        },
        {
          "begin": "\\b(use)\\s",
          "beginCaptures": {
            "1": {
              "name": "keyword.other.rust"
            }
          },
          "end": ";",
          "endCaptures": {
            "0": {
              "name": "punctuation.semi.rust"
            }
          },
          "name": "meta.use.rust",
          "patterns": [
            {
              "include": "#block-comments"
            },
            {
              "include": "#comments"
            },
            {
              "include": "#keywords"
            },
            {
              "include": "#namespaces"
            },
            {
              "include": "#punctuation"
            },
            {
              "include": "#types"
            },
            {
              "include": "#lvariables"
            }
          ]
        },
        {
          "include": "#block-comments"
        },
        {
          "include": "#comments"
        },
        {
          "include": "#attributes"
        },
        {
          "include": "#lvariables"
        },
        {
          "include": "#constants"
        },
        {
          "include": "#gtypes"
        },
        {
          "include": "#functions"
        },
        {
          "include": "#types"
        },
        {
          "include": "#keywords"
        },
        {
          "include": "#lifetimes"
        },
        {
          "include": "#macros"
        },
        {
          "include": "#namespaces"
        },
        {
          "include": "#punctuation"
        },
        {
          "include": "#strings"
        },
        {
          "include": "#variables"
        }
      ],
      "repository": {
        "attributes": {
          "begin": "(#)(!?)(\\[)",
          "beginCaptures": {
            "1": {
              "name": "punctuation.definition.attribute.rust"
            },
            "3": {
              "name": "punctuation.brackets.attribute.rust"
            }
          },
          "end": "]",
          "endCaptures": {
            "0": {
              "name": "punctuation.brackets.attribute.rust"
            }
          },
          "name": "meta.attribute.rust",
          "patterns": [
            {
              "include": "#block-comments"
            },
            {
              "include": "#comments"
            },
            {
              "include": "#keywords"
            },
            {
              "include": "#lifetimes"
            },
            {
              "include": "#punctuation"
            },
            {
              "include": "#strings"
            },
            {
              "include": "#gtypes"
            },
            {
              "include": "#types"
            }
          ]
        },
        "block-comments": {
          "patterns": [
            {
              "match": "/\\*\\*/",
              "name": "comment.block.rust"
            },
            {
              "begin": "/\\*\\*",
              "end": "\\*/",
              "name": "comment.block.documentation.rust",
              "patterns": [
                {
                  "include": "#block-comments"
                }
              ]
            },
            {
              "begin": "/\\*(?!\\*)",
              "end": "\\*/",
              "name": "comment.block.rust",
              "patterns": [
                {
                  "include": "#block-comments"
                }
              ]
            }
          ]
        },
        "comments": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "name": "punctuation.definition.comment.rust"
                }
              },
              "match": "(///).*$",
              "name": "comment.line.documentation.rust"
            },
            {
              "captures": {
                "1": {
                  "name": "punctuation.definition.comment.rust"
                }
              },
              "match": "(//).*$",
              "name": "comment.line.double-slash.rust"
            }
          ]
        },
        "constants": {
          "patterns": [
            {
              "match": "\\b[A-Z]{2}[0-9A-Z_]*\\b",
              "name": "constant.other.caps.rust"
            },
            {
              "captures": {
                "1": {
                  "name": "storage.type.rust"
                },
                "2": {
                  "name": "constant.other.caps.rust"
                }
              },
              "match": "\\b(const)\\s+([A-Z][0-9A-Z_a-z]*)\\b"
            },
            {
              "captures": {
                "1": {
                  "name": "punctuation.separator.dot.decimal.rust"
                },
                "2": {
                  "name": "keyword.operator.exponent.rust"
                },
                "3": {
                  "name": "keyword.operator.exponent.sign.rust"
                },
                "4": {
                  "name": "constant.numeric.decimal.exponent.mantissa.rust"
                },
                "5": {
                  "name": "entity.name.type.numeric.rust"
                }
              },
              "match": "\\b\\d[_\\d]*(\\.?)[_\\d]*(?:([Ee])([-+]?)([_\\d]+))?(f32|f64|i128|i16|i32|i64|i8|isize|u128|u16|u32|u64|u8|usize)?\\b",
              "name": "constant.numeric.decimal.rust"
            },
            {
              "captures": {
                "1": {
                  "name": "entity.name.type.numeric.rust"
                }
              },
              "match": "\\b0x[A-F_a-f\\d]+(i128|i16|i32|i64|i8|isize|u128|u16|u32|u64|u8|usize)?\\b",
              "name": "constant.numeric.hex.rust"
            },
            {
              "captures": {
                "1": {
                  "name": "entity.name.type.numeric.rust"
                }
              },
              "match": "\\b0o[0-7_]+(i128|i16|i32|i64|i8|isize|u128|u16|u32|u64|u8|usize)?\\b",
              "name": "constant.numeric.oct.rust"
            },
            {
              "captures": {
                "1": {
                  "name": "entity.name.type.numeric.rust"
                }
              },
              "match": "\\b0b[01_]+(i128|i16|i32|i64|i8|isize|u128|u16|u32|u64|u8|usize)?\\b",
              "name": "constant.numeric.bin.rust"
            },
            {
              "match": "\\b(true|false)\\b",
              "name": "constant.language.bool.rust"
            }
          ]
        },
        "escapes": {
          "captures": {
            "1": {
              "name": "constant.character.escape.backslash.rust"
            },
            "2": {
              "name": "constant.character.escape.bit.rust"
            },
            "3": {
              "name": "constant.character.escape.unicode.rust"
            },
            "4": {
              "name": "constant.character.escape.unicode.punctuation.rust"
            },
            "5": {
              "name": "constant.character.escape.unicode.punctuation.rust"
            }
          },
          "match": "(\\\\)(?:(x[0-7][A-Fa-f\\d])|(u(\\{)[A-Fa-f\\d]{4,6}(}))|.)",
          "name": "constant.character.escape.rust"
        },
        "functions": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "name": "keyword.other.rust"
                },
                "2": {
                  "name": "punctuation.brackets.round.rust"
                }
              },
              "match": "\\b(pub)(\\()"
            },
            {
              "begin": "\\b(fn)\\s+((?:r#(?!crate|[Ss]elf|super))?[0-9A-Z_a-z]+)((\\()|(<))",
              "beginCaptures": {
                "1": {
                  "name": "keyword.other.fn.rust"
                },
                "2": {
                  "name": "entity.name.function.rust"
                },
                "4": {
                  "name": "punctuation.brackets.round.rust"
                },
                "5": {
                  "name": "punctuation.brackets.angle.rust"
                }
              },
              "end": "(\\{)|(;)",
              "endCaptures": {
                "1": {
                  "name": "punctuation.brackets.curly.rust"
                },
                "2": {
                  "name": "punctuation.semi.rust"
                }
              },
              "name": "meta.function.definition.rust",
              "patterns": [
                {
                  "include": "#block-comments"
                },
                {
                  "include": "#comments"
                },
                {
                  "include": "#keywords"
                },
                {
                  "include": "#lvariables"
                },
                {
                  "include": "#constants"
                },
                {
                  "include": "#gtypes"
                },
                {
                  "include": "#functions"
                },
                {
                  "include": "#lifetimes"
                },
                {
                  "include": "#macros"
                },
                {
                  "include": "#namespaces"
                },
                {
                  "include": "#punctuation"
                },
                {
                  "include": "#strings"
                },
                {
                  "include": "#types"
                },
                {
                  "include": "#variables"
                }
              ]
            },
            {
              "begin": "((?:r#(?!crate|[Ss]elf|super))?[0-9A-Z_a-z]+)(\\()",
              "beginCaptures": {
                "1": {
                  "name": "entity.name.function.rust"
                },
                "2": {
                  "name": "punctuation.brackets.round.rust"
                }
              },
              "end": "\\)",
              "endCaptures": {
                "0": {
                  "name": "punctuation.brackets.round.rust"
                }
              },
              "name": "meta.function.call.rust",
              "patterns": [
                {
                  "include": "#block-comments"
                },
                {
                  "include": "#comments"
                },
                {
                  "include": "#attributes"
                },
                {
                  "include": "#keywords"
                },
                {
                  "include": "#lvariables"
                },
                {
                  "include": "#constants"
                },
                {
                  "include": "#gtypes"
                },
                {
                  "include": "#functions"
                },
                {
                  "include": "#lifetimes"
                },
                {
                  "include": "#macros"
                },
                {
                  "include": "#namespaces"
                },
                {
                  "include": "#punctuation"
                },
                {
                  "include": "#strings"
                },
                {
                  "include": "#types"
                },
                {
                  "include": "#variables"
                }
              ]
            },
            {
              "begin": "((?:r#(?!crate|[Ss]elf|super))?[0-9A-Z_a-z]+)(?=::<.*>\\()",
              "beginCaptures": {
                "1": {
                  "name": "entity.name.function.rust"
                }
              },
              "end": "\\)",
              "endCaptures": {
                "0": {
                  "name": "punctuation.brackets.round.rust"
                }
              },
              "name": "meta.function.call.rust",
              "patterns": [
                {
                  "include": "#block-comments"
                },
                {
                  "include": "#comments"
                },
                {
                  "include": "#attributes"
                },
                {
                  "include": "#keywords"
                },
                {
                  "include": "#lvariables"
                },
                {
                  "include": "#constants"
                },
                {
                  "include": "#gtypes"
                },
                {
                  "include": "#functions"
                },
                {
                  "include": "#lifetimes"
                },
                {
                  "include": "#macros"
                },
                {
                  "include": "#namespaces"
                },
                {
                  "include": "#punctuation"
                },
                {
                  "include": "#strings"
                },
                {
                  "include": "#types"
                },
                {
                  "include": "#variables"
                }
              ]
            }
          ]
        },
        "gtypes": {
          "patterns": [
            {
              "match": "\\b(Some|None)\\b",
              "name": "entity.name.type.option.rust"
            },
            {
              "match": "\\b(Ok|Err)\\b",
              "name": "entity.name.type.result.rust"
            }
          ]
        },
        "interpolations": {
          "captures": {
            "1": {
              "name": "punctuation.definition.interpolation.rust"
            },
            "2": {
              "name": "punctuation.definition.interpolation.rust"
            }
          },
          "match": "(\\{)[^\"{}]*(})",
          "name": "meta.interpolation.rust"
        },
        "keywords": {
          "patterns": [
            {
              "match": "\\b(await|break|continue|do|else|for|if|loop|match|return|try|while|yield)\\b",
              "name": "keyword.control.rust"
            },
            {
              "match": "\\b(extern|let|macro|mod)\\b",
              "name": "keyword.other.rust storage.type.rust"
            },
            {
              "match": "\\b(const)\\b",
              "name": "storage.modifier.rust"
            },
            {
              "match": "\\b(type)\\b",
              "name": "keyword.declaration.type.rust storage.type.rust"
            },
            {
              "match": "\\b(enum)\\b",
              "name": "keyword.declaration.enum.rust storage.type.rust"
            },
            {
              "match": "\\b(trait)\\b",
              "name": "keyword.declaration.trait.rust storage.type.rust"
            },
            {
              "match": "\\b(struct)\\b",
              "name": "keyword.declaration.struct.rust storage.type.rust"
            },
            {
              "match": "\\b(abstract|static)\\b",
              "name": "storage.modifier.rust"
            },
            {
              "match": "\\b(as|async|become|box|dyn|move|final|gen|impl|in|override|priv|pub|ref|typeof|union|unsafe|unsized|use|virtual|where)\\b",
              "name": "keyword.other.rust"
            },
            {
              "match": "\\bfn\\b",
              "name": "keyword.other.fn.rust"
            },
            {
              "match": "\\bcrate\\b",
              "name": "keyword.other.crate.rust"
            },
            {
              "match": "\\bmut\\b",
              "name": "storage.modifier.mut.rust"
            },
            {
              "match": "([\\^|]|\\|\\||&&|<<|>>|!)(?!=)",
              "name": "keyword.operator.logical.rust"
            },
            {
              "match": "&(?![\\&=])",
              "name": "keyword.operator.borrow.and.rust"
            },
            {
              "match": "((?:[-%\\&*+/^|]|<<|>>)=)",
              "name": "keyword.operator.assignment.rust"
            },
            {
              "match": "(?<![<>])=(?![=>])",
              "name": "keyword.operator.assignment.equal.rust"
            },
            {
              "match": "(=(=)?(?!>)|!=|<=|(?<!=)>=)",
              "name": "keyword.operator.comparison.rust"
            },
            {
              "match": "(([%+]|(\\*(?!\\w)))(?!=))|(-(?!>))|(/(?!/))",
              "name": "keyword.operator.math.rust"
            },
            {
              "captures": {
                "1": {
                  "name": "punctuation.brackets.round.rust"
                },
                "2": {
                  "name": "punctuation.brackets.square.rust"
                },
                "3": {
                  "name": "punctuation.brackets.curly.rust"
                },
                "4": {
                  "name": "keyword.operator.comparison.rust"
                },
                "5": {
                  "name": "punctuation.brackets.round.rust"
                },
                "6": {
                  "name": "punctuation.brackets.square.rust"
                },
                "7": {
                  "name": "punctuation.brackets.curly.rust"
                }
              },
              "match": "(?:\\b|(?:(\\))|(])|(})))[\\t ]+([<>])[\\t ]+(?:\\b|(?:(\\()|(\\[)|(\\{)))"
            },
            {
              "match": "::",
              "name": "keyword.operator.namespace.rust"
            },
            {
              "captures": {
                "1": {
                  "name": "keyword.operator.dereference.rust"
                }
              },
              "match": "(\\*)(?=\\w+)"
            },
            {
              "match": "@",
              "name": "keyword.operator.subpattern.rust"
            },
            {
              "match": "\\.(?!\\.)",
              "name": "keyword.operator.access.dot.rust"
            },
            {
              "match": "\\.{2}([.=])?",
              "name": "keyword.operator.range.rust"
            },
            {
              "match": ":(?!:)",
              "name": "keyword.operator.key-value.rust"
            },
            {
              "match": "->|<-",
              "name": "keyword.operator.arrow.skinny.rust"
            },
            {
              "match": "=>",
              "name": "keyword.operator.arrow.fat.rust"
            },
            {
              "match": "\\$",
              "name": "keyword.operator.macro.dollar.rust"
            },
            {
              "match": "\\?",
              "name": "keyword.operator.question.rust"
            }
          ]
        },
        "lifetimes": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "name": "punctuation.definition.lifetime.rust"
                },
                "2": {
                  "name": "entity.name.type.lifetime.rust"
                }
              },
              "match": "(')([A-Z_a-z][0-9A-Z_a-z]*)(?!')\\b"
            },
            {
              "captures": {
                "1": {
                  "name": "keyword.operator.borrow.rust"
                },
                "2": {
                  "name": "punctuation.definition.lifetime.rust"
                },
                "3": {
                  "name": "entity.name.type.lifetime.rust"
                }
              },
              "match": "(&)(')([A-Z_a-z][0-9A-Z_a-z]*)(?!')\\b"
            }
          ]
        },
        "lvariables": {
          "patterns": [
            {
              "match": "\\b[Ss]elf\\b",
              "name": "variable.language.self.rust"
            },
            {
              "match": "\\bsuper\\b",
              "name": "variable.language.super.rust"
            }
          ]
        },
        "macros": {
          "patterns": [
            {
              "captures": {
                "2": {
                  "name": "entity.name.function.macro.rust"
                },
                "3": {
                  "name": "entity.name.type.macro.rust"
                }
              },
              "match": "(([_a-z][0-9A-Z_a-z]*!)|([A-Z_][0-9A-Z_a-z]*!))",
              "name": "meta.macro.rust"
            }
          ]
        },
        "namespaces": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "name": "entity.name.namespace.rust"
                },
                "2": {
                  "name": "keyword.operator.namespace.rust"
                }
              },
              "match": "(?<![0-9A-Z_a-z])([0-9A-Z_a-z]+)((?<!s(?:uper|elf))::)"
            }
          ]
        },
        "punctuation": {
          "patterns": [
            {
              "match": ",",
              "name": "punctuation.comma.rust"
            },
            {
              "match": "[{}]",
              "name": "punctuation.brackets.curly.rust"
            },
            {
              "match": "[()]",
              "name": "punctuation.brackets.round.rust"
            },
            {
              "match": ";",
              "name": "punctuation.semi.rust"
            },
            {
              "match": "[]\\[]",
              "name": "punctuation.brackets.square.rust"
            },
            {
              "match": "(?<!=)[<>]",
              "name": "punctuation.brackets.angle.rust"
            }
          ]
        },
        "strings": {
          "patterns": [
            {
              "begin": "(b?)(\")",
              "beginCaptures": {
                "1": {
                  "name": "string.quoted.byte.raw.rust"
                },
                "2": {
                  "name": "punctuation.definition.string.rust"
                }
              },
              "end": "\"",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.string.rust"
                }
              },
              "name": "string.quoted.double.rust",
              "patterns": [
                {
                  "include": "#escapes"
                },
                {
                  "include": "#interpolations"
                }
              ]
            },
            {
              "begin": "(b?r)(#*)(\")",
              "beginCaptures": {
                "1": {
                  "name": "string.quoted.byte.raw.rust"
                },
                "2": {
                  "name": "punctuation.definition.string.raw.rust"
                },
                "3": {
                  "name": "punctuation.definition.string.rust"
                }
              },
              "end": "(\")(\\2)",
              "endCaptures": {
                "1": {
                  "name": "punctuation.definition.string.rust"
                },
                "2": {
                  "name": "punctuation.definition.string.raw.rust"
                }
              },
              "name": "string.quoted.double.rust"
            },
            {
              "begin": "(b)?(')",
              "beginCaptures": {
                "1": {
                  "name": "string.quoted.byte.raw.rust"
                },
                "2": {
                  "name": "punctuation.definition.char.rust"
                }
              },
              "end": "'",
              "endCaptures": {
                "0": {
                  "name": "punctuation.definition.char.rust"
                }
              },
              "name": "string.quoted.single.char.rust",
              "patterns": [
                {
                  "include": "#escapes"
                }
              ]
            }
          ]
        },
        "types": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "name": "entity.name.type.numeric.rust"
                }
              },
              "match": "(?<![A-Za-z])(f32|f64|i128|i16|i32|i64|i8|isize|u128|u16|u32|u64|u8|usize)\\b"
            },
            {
              "begin": "\\b(_?[A-Z][0-9A-Z_a-z]*)(<)",
              "beginCaptures": {
                "1": {
                  "name": "entity.name.type.rust"
                },
                "2": {
                  "name": "punctuation.brackets.angle.rust"
                }
              },
              "end": ">",
              "endCaptures": {
                "0": {
                  "name": "punctuation.brackets.angle.rust"
                }
              },
              "patterns": [
                {
                  "include": "#block-comments"
                },
                {
                  "include": "#comments"
                },
                {
                  "include": "#keywords"
                },
                {
                  "include": "#lvariables"
                },
                {
                  "include": "#lifetimes"
                },
                {
                  "include": "#punctuation"
                },
                {
                  "include": "#types"
                },
                {
                  "include": "#variables"
                }
              ]
            },
            {
              "match": "\\b(bool|char|str)\\b",
              "name": "entity.name.type.primitive.rust"
            },
            {
              "captures": {
                "1": {
                  "name": "keyword.declaration.trait.rust storage.type.rust"
                },
                "2": {
                  "name": "entity.name.type.trait.rust"
                }
              },
              "match": "\\b(trait)\\s+(_?[A-Z][0-9A-Z_a-z]*)\\b"
            },
            {
              "captures": {
                "1": {
                  "name": "keyword.declaration.struct.rust storage.type.rust"
                },
                "2": {
                  "name": "entity.name.type.struct.rust"
                }
              },
              "match": "\\b(struct)\\s+(_?[A-Z][0-9A-Z_a-z]*)\\b"
            },
            {
              "captures": {
                "1": {
                  "name": "keyword.declaration.enum.rust storage.type.rust"
                },
                "2": {
                  "name": "entity.name.type.enum.rust"
                }
              },
              "match": "\\b(enum)\\s+(_?[A-Z][0-9A-Z_a-z]*)\\b"
            },
            {
              "captures": {
                "1": {
                  "name": "keyword.declaration.type.rust storage.type.rust"
                },
                "2": {
                  "name": "entity.name.type.declaration.rust"
                }
              },
              "match": "\\b(type)\\s+(_?[A-Z][0-9A-Z_a-z]*)\\b"
            },
            {
              "match": "\\b_?[A-Z][0-9A-Z_a-z]*\\b(?!!)",
              "name": "entity.name.type.rust"
            }
          ]
        },
        "variables": {
          "patterns": [
            {
              "match": "\\b(?<!(?<!\\.)\\.)(?:r#(?!(crate|[Ss]elf|super)))?[0-9_a-z]+\\b",
              "name": "variable.other.rust"
            }
          ]
        }
      },
      "scopeName": "source.rust"
    },
    "python": {
      "displayName": "Python",
      "name": "python",
      "patterns": [
        {
          "include": "#statement"
        },
        {
          "include": "#expression"
        }
      ],
      "repository": {
        "annotated-parameter": {
          "begin": "\\b([_[:alpha:]]\\w*)\\s*(:)",
          "beginCaptures": {
            "1": {
              "name": "variable.parameter.function.language.python"
            },
            "2": {
              "name": "punctuation.separator.annotation.python"
            }
          },
          "end": "(,)|(?=\\))",
          "endCaptures": {
            "1": {
              "name": "punctuation.separator.parameters.python"
            }
          },
          "patterns": [
            {
              "include": "#expression"
            },
            {
              "match": "=(?!=)",
              "name": "keyword.operator.assignment.python"
            }
          ]
        },
        "assignment-operator": {
          "match": "<<=|>>=|//=|\\*\\*=|\\+=|-=|/=|@=|\\*=|%=|~=|\\^=|&=|\\|=|=(?!=)",
          "name": "keyword.operator.assignment.python"
        },
        "backticks": {
          "begin": "`",
          "end": "`|(?<!\\\\)(\\n)",
          "name": "invalid.deprecated.backtick.python",
          "patterns": [
            {
              "include": "#expression"
            }
          ]
        },
        "builtin-callables": {
          "patterns": [
            {
              "include": "#illegal-names"
            },
            {
              "include": "#illegal-object-name"
            },
            {
              "include": "#builtin-exceptions"
            },
            {
              "include": "#builtin-functions"
            },
            {
              "include": "#builtin-types"
            }
          ]
        },
        "builtin-exceptions": {
          "match": "(?<!\\.)\\b((Arithmetic|Assertion|Attribute|Buffer|BlockingIO|BrokenPipe|ChildProcess|(Connection(Aborted|Refused|Reset)?)|EOF|Environment|FileExists|FileNotFound|FloatingPoint|IO|Import|Indentation|Index|Interrupted|IsADirectory|NotADirectory|Permission|ProcessLookup|Timeout|Key|Lookup|Memory|Name|NotImplemented|OS|Overflow|Reference|Runtime|Recursion|Syntax|System|Tab|Type|UnboundLocal|Unicode(Encode|Decode|Translate)?|Value|Windows|ZeroDivision|ModuleNotFound)Error|((Pending)?Deprecation|Runtime|Syntax|User|Future|Import|Unicode|Bytes|Resource)?Warning|SystemExit|Stop(Async)?Iteration|KeyboardInterrupt|GeneratorExit|(Base)?Exception)\\b",
          "name": "support.type.exception.python"
        },
        "builtin-functions": {
          "patterns": [
            {
              "match": "(?<!\\.)\\b(__import__|abs|aiter|all|any|anext|ascii|bin|breakpoint|callable|chr|compile|copyright|credits|delattr|dir|divmod|enumerate|eval|exec|exit|filter|format|getattr|globals|hasattr|hash|help|hex|id|input|isinstance|issubclass|iter|len|license|locals|map|max|memoryview|min|next|oct|open|ord|pow|print|quit|range|reload|repr|reversed|round|setattr|sorted|sum|vars|zip)\\b",
              "name": "support.function.builtin.python"
            },
            {
              "match": "(?<!\\.)\\b(file|reduce|intern|raw_input|unicode|cmp|basestring|execfile|long|xrange)\\b",
              "name": "variable.legacy.builtin.python"
            }
          ]
        },
        "builtin-possible-callables": {
          "patterns": [
            {
              "include": "#builtin-callables"
            },
            {
              "include": "#magic-names"
            }
          ]
        },
        "builtin-types": {
          "match": "(?<!\\.)\\b(bool|bytearray|bytes|classmethod|complex|dict|float|frozenset|int|list|object|property|set|slice|staticmethod|str|tuple|type|super)\\b",
          "name": "support.type.python"
        },
        "call-wrapper-inheritance": {
          "begin": "\\b(?=([_[:alpha:]]\\w*)\\s*(\\())",
          "end": "(\\))",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.arguments.end.python"
            }
          },
          "name": "meta.function-call.python",
          "patterns": [
            {
              "include": "#inheritance-name"
            },
            {
              "include": "#function-arguments"
            }
          ]
        },
        "class-declaration": {
          "patterns": [
            {
              "begin": "\\s*(class)\\s+(?=[_[:alpha:]]\\w*\\s*([(:]))",
              "beginCaptures": {
                "1": {
                  "name": "storage.type.class.python"
                }
              },
              "end": "(:)",
              "endCaptures": {
                "1": {
                  "name": "punctuation.section.class.begin.python"
                }
              },
              "name": "meta.class.python",
              "patterns": [
                {
                  "include": "#class-name"
                },
                {
                  "include": "#class-inheritance"
                }
              ]
            }
          ]
        },
        "class-inheritance": {
          "begin": "(\\()",
          "beginCaptures": {
            "1": {
              "name": "punctuation.definition.inheritance.begin.python"
            }
          },
          "end": "(\\))",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.inheritance.end.python"
            }
          },
          "name": "meta.class.inheritance.python",
          "patterns": [
            {
              "match": "(\\*\\*?)",
              "name": "keyword.operator.unpacking.arguments.python"
            },
            {
              "match": ",",
              "name": "punctuation.separator.inheritance.python"
            },
            {
              "match": "=(?!=)",
              "name": "keyword.operator.assignment.python"
            },
            {
              "match": "\\bmetaclass\\b",
              "name": "support.type.metaclass.python"
            },
            {
              "include": "#illegal-names"
            },
            {
              "include": "#class-kwarg"
            },
            {
              "include": "#call-wrapper-inheritance"
            },
            {
              "include": "#expression-base"
            },
            {
              "include": "#member-access-class"
            },
            {
              "include": "#inheritance-identifier"
            }
          ]
        },
        "class-kwarg": {
          "captures": {
            "1": {
              "name": "entity.other.inherited-class.python variable.parameter.class.python"
            },
            "2": {
              "name": "keyword.operator.assignment.python"
            }
          },
          "match": "\\b([_[:alpha:]]\\w*)\\s*(=)(?!=)"
        },
        "class-name": {
          "patterns": [
            {
              "include": "#illegal-object-name"
            },
            {
              "include": "#builtin-possible-callables"
            },
            {
              "match": "\\b([_[:alpha:]]\\w*)\\b",
              "name": "entity.name.type.class.python"
            }
          ]
        },
        "codetags": {
          "captures": {
            "1": {
              "name": "keyword.codetag.notation.python"
            }
          },
          "match": "\\b(NOTE|XXX|HACK|FIXME|BUG|TODO)\\b"
        },
        "comments": {
          "patterns": [
            {
              "begin": "#\\s*(type:)\\s*+(?!$|#)",
              "beginCaptures": {
                "0": {
                  "name": "meta.typehint.comment.python"
                },
                "1": {
                  "name": "comment.typehint.directive.notation.python"
                }
              },
              "contentName": "meta.typehint.comment.python",
              "end": "$|(?=#)",
              "name": "comment.line.number-sign.python",
              "patterns": [
                {
                  "match": "\\Gignore(?=\\s*(?:$|#))",
                  "name": "comment.typehint.ignore.notation.python"
                },
                {
                  "match": "(?<!\\.)\\b(bool|bytes|float|int|object|str|List|Dict|Iterable|Sequence|Set|FrozenSet|Callable|Union|Tuple|Any|None)\\b",
                  "name": "comment.typehint.type.notation.python"
                },
                {
                  "match": "([]()*,.=\\[]|(->))",
                  "name": "comment.typehint.punctuation.notation.python"
                },
                {
                  "match": "([_[:alpha:]]\\w*)",
                  "name": "comment.typehint.variable.notation.python"
                }
              ]
            },
            {
              "include": "#comments-base"
            }
          ]
        },
        "comments-base": {
          "begin": "(#)",
          "beginCaptures": {
            "1": {
              "name": "punctuation.definition.comment.python"
            }
          },
          "end": "$()",
          "name": "comment.line.number-sign.python",
          "patterns": [
            {
              "include": "#codetags"
            }
          ]
        },
        "comments-string-double-three": {
          "begin": "(#)",
          "beginCaptures": {
            "1": {
              "name": "punctuation.definition.comment.python"
            }
          },
          "end": "($|(?=\"\"\"))",
          "name": "comment.line.number-sign.python",
          "patterns": [
            {
              "include": "#codetags"
            }
          ]
        },
        "comments-string-single-three": {
          "begin": "(#)",
          "beginCaptures": {
            "1": {
              "name": "punctuation.definition.comment.python"
            }
          },
          "end": "($|(?='''))",
          "name": "comment.line.number-sign.python",
          "patterns": [
            {
              "include": "#codetags"
            }
          ]
        },
        "curly-braces": {
          "begin": "\\{",
          "beginCaptures": {
            "0": {
              "name": "punctuation.definition.dict.begin.python"
            }
          },
          "end": "}",
          "endCaptures": {
            "0": {
              "name": "punctuation.definition.dict.end.python"
            }
          },
          "patterns": [
            {
              "match": ":",
              "name": "punctuation.separator.dict.python"
            },
            {
              "include": "#expression"
            }
          ]
        },
        "decorator": {
          "begin": "^\\s*((@))\\s*(?=[_[:alpha:]]\\w*)",
          "beginCaptures": {
            "1": {
              "name": "entity.name.function.decorator.python"
            },
            "2": {
              "name": "punctuation.definition.decorator.python"
            }
          },
          "end": "(\\))(.*?)(?=\\s*(?:#|$))|(?=[\\n#])",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.arguments.end.python"
            },
            "2": {
              "name": "invalid.illegal.decorator.python"
            }
          },
          "name": "meta.function.decorator.python",
          "patterns": [
            {
              "include": "#decorator-name"
            },
            {
              "include": "#function-arguments"
            }
          ]
        },
        "decorator-name": {
          "patterns": [
            {
              "include": "#builtin-callables"
            },
            {
              "include": "#illegal-object-name"
            },
            {
              "captures": {
                "2": {
                  "name": "punctuation.separator.period.python"
                }
              },
              "match": "([_[:alpha:]]\\w*)|(\\.)",
              "name": "entity.name.function.decorator.python"
            },
            {
              "include": "#line-continuation"
            },
            {
              "captures": {
                "1": {
                  "name": "invalid.illegal.decorator.python"
                }
              },
              "match": "\\s*([^#(.\\\\_[:alpha:]\\s].*?)(?=#|$)",
              "name": "invalid.illegal.decorator.python"
            }
          ]
        },
        "docstring": {
          "patterns": [
            {
              "begin": "('''|\"\"\")",
              "beginCaptures": {
                "1": {
                  "name": "punctuation.definition.string.begin.python"
                }
              },
              "end": "(\\1)",
              "endCaptures": {
                "1": {
                  "name": "punctuation.definition.string.end.python"
                }
              },
              "name": "string.quoted.docstring.multi.python",
              "patterns": [
                {
                  "include": "#docstring-prompt"
                },
                {
                  "include": "#codetags"
                },
                {
                  "include": "#docstring-guts-unicode"
                }
              ]
            },
            {
              "begin": "([Rr])('''|\"\"\")",
              "beginCaptures": {
                "1": {
                  "name": "storage.type.string.python"
                },
                "2": {
                  "name": "punctuation.definition.string.begin.python"
                }
              },
              "end": "(\\2)",
              "endCaptures": {
                "1": {
                  "name": "punctuation.definition.string.end.python"
                }
              },
              "name": "string.quoted.docstring.raw.multi.python",
              "patterns": [
                {
                  "include": "#string-consume-escape"
                },
                {
                  "include": "#docstring-prompt"
                },
                {
                  "include": "#codetags"
                }
              ]
            },
            {
              "begin": "([\"'])",
              "beginCaptures": {
                "1": {
                  "name": "punctuation.definition.string.begin.python"
                }
              },
              "end": "(\\1)|(\\n)",
              "endCaptures": {
                "1": {
                  "name": "punctuation.definition.string.end.python"
                },
                "2": {
                  "name": "invalid.illegal.newline.python"
                }
              },
              "name": "string.quoted.docstring.single.python",
              "patterns": [
                {
                  "include": "#codetags"
                },
                {
                  "include": "#docstring-guts-unicode"
                }
              ]
            },
            {
              "begin": "([Rr])([\"'])",
              "beginCaptures": {
                "1": {
                  "name": "storage.type.string.python"
                },
                "2": {
                  "name": "punctuation.definition.string.begin.python"
                }
              },
              "end": "(\\2)|(\\n)",
              "endCaptures": {
                "1": {
                  "name": "punctuation.definition.string.end.python"
                },
                "2": {
                  "name": "invalid.illegal.newline.python"
                }
              },
              "name": "string.quoted.docstring.raw.single.python",
              "patterns": [
                {
                  "include": "#string-consume-escape"
                },
                {
                  "include": "#codetags"
                }
              ]
            }
          ]
        },
        "docstring-guts-unicode": {
          "patterns": [
            {
              "include": "#escape-sequence-unicode"
            },
            {
              "include": "#escape-sequence"
            },
            {
              "include": "#string-line-continuation"
            }
          ]
        },
        "docstring-prompt": {
          "captures": {
            "1": {
              "name": "keyword.control.flow.python"
            }
          },
          "match": "(?:^|\\G)\\s*((?:>>>|\\.\\.\\.)\\s)(?=\\s*\\S)"
        },
        "docstring-statement": {
          "begin": "^(?=\\s*[Rr]?('''|\"\"\"|[\"']))",
          "end": "((?<=\\1)|^)(?!\\s*[Rr]?('''|\"\"\"|[\"']))",
          "patterns": [
            {
              "include": "#docstring"
            }
          ]
        },
        "double-one-regexp-character-set": {
          "patterns": [
            {
              "match": "\\[\\^?](?!.*?])"
            },
            {
              "begin": "(\\[)(\\^)?(])?",
              "beginCaptures": {
                "1": {
                  "name": "punctuation.character.set.begin.regexp constant.other.set.regexp"
                },
                "2": {
                  "name": "keyword.operator.negation.regexp"
                },
                "3": {
                  "name": "constant.character.set.regexp"
                }
              },
              "end": "(]|(?=\"))|((?=(?<!\\\\)\\n))",
              "endCaptures": {
                "1": {
                  "name": "punctuation.character.set.end.regexp constant.other.set.regexp"
                },
                "2": {
                  "name": "invalid.illegal.newline.python"
                }
              },
              "name": "meta.character.set.regexp",
              "patterns": [
                {
                  "include": "#regexp-charecter-set-escapes"
                },
                {
                  "match": "\\N",
                  "name": "constant.character.set.regexp"
                }
              ]
            }
          ]
        },
        "double-one-regexp-comments": {
          "begin": "\\(\\?#",
          "beginCaptures": {
            "0": {
              "name": "punctuation.comment.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "punctuation.comment.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "comment.regexp",
          "patterns": [
            {
              "include": "#codetags"
            }
          ]
        },
        "double-one-regexp-conditional": {
          "begin": "(\\()\\?\\((\\w+(?:\\s+\\p{alnum}+)?|\\d+)\\)",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.conditional.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.conditional.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.conditional.negative.regexp punctuation.parenthesis.conditional.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#double-one-regexp-expression"
            }
          ]
        },
        "double-one-regexp-expression": {
          "patterns": [
            {
              "include": "#regexp-base-expression"
            },
            {
              "include": "#double-one-regexp-character-set"
            },
            {
              "include": "#double-one-regexp-comments"
            },
            {
              "include": "#regexp-flags"
            },
            {
              "include": "#double-one-regexp-named-group"
            },
            {
              "include": "#regexp-backreference"
            },
            {
              "include": "#double-one-regexp-lookahead"
            },
            {
              "include": "#double-one-regexp-lookahead-negative"
            },
            {
              "include": "#double-one-regexp-lookbehind"
            },
            {
              "include": "#double-one-regexp-lookbehind-negative"
            },
            {
              "include": "#double-one-regexp-conditional"
            },
            {
              "include": "#double-one-regexp-parentheses-non-capturing"
            },
            {
              "include": "#double-one-regexp-parentheses"
            }
          ]
        },
        "double-one-regexp-lookahead": {
          "begin": "(\\()\\?=",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookahead.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookahead.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookahead.regexp punctuation.parenthesis.lookahead.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#double-one-regexp-expression"
            }
          ]
        },
        "double-one-regexp-lookahead-negative": {
          "begin": "(\\()\\?!",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookahead.negative.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookahead.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookahead.negative.regexp punctuation.parenthesis.lookahead.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#double-one-regexp-expression"
            }
          ]
        },
        "double-one-regexp-lookbehind": {
          "begin": "(\\()\\?<=",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookbehind.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookbehind.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookbehind.regexp punctuation.parenthesis.lookbehind.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#double-one-regexp-expression"
            }
          ]
        },
        "double-one-regexp-lookbehind-negative": {
          "begin": "(\\()\\?<!",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookbehind.negative.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookbehind.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookbehind.negative.regexp punctuation.parenthesis.lookbehind.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#double-one-regexp-expression"
            }
          ]
        },
        "double-one-regexp-named-group": {
          "begin": "(\\()(\\?P<\\w+(?:\\s+\\p{alnum}+)?>)",
          "beginCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.named.begin.regexp"
            },
            "2": {
              "name": "entity.name.tag.named.group.regexp"
            }
          },
          "end": "(\\)|(?=\"))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.named.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "meta.named.regexp",
          "patterns": [
            {
              "include": "#double-one-regexp-expression"
            }
          ]
        },
        "double-one-regexp-parentheses": {
          "begin": "\\(",
          "beginCaptures": {
            "0": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#double-one-regexp-expression"
            }
          ]
        },
        "double-one-regexp-parentheses-non-capturing": {
          "begin": "\\(\\?:",
          "beginCaptures": {
            "0": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.non-capturing.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.non-capturing.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#double-one-regexp-expression"
            }
          ]
        },
        "double-three-regexp-character-set": {
          "patterns": [
            {
              "match": "\\[\\^?](?!.*?])"
            },
            {
              "begin": "(\\[)(\\^)?(])?",
              "beginCaptures": {
                "1": {
                  "name": "punctuation.character.set.begin.regexp constant.other.set.regexp"
                },
                "2": {
                  "name": "keyword.operator.negation.regexp"
                },
                "3": {
                  "name": "constant.character.set.regexp"
                }
              },
              "end": "(]|(?=\"\"\"))",
              "endCaptures": {
                "1": {
                  "name": "punctuation.character.set.end.regexp constant.other.set.regexp"
                },
                "2": {
                  "name": "invalid.illegal.newline.python"
                }
              },
              "name": "meta.character.set.regexp",
              "patterns": [
                {
                  "include": "#regexp-charecter-set-escapes"
                },
                {
                  "match": "\\N",
                  "name": "constant.character.set.regexp"
                }
              ]
            }
          ]
        },
        "double-three-regexp-comments": {
          "begin": "\\(\\?#",
          "beginCaptures": {
            "0": {
              "name": "punctuation.comment.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"\"\"))",
          "endCaptures": {
            "1": {
              "name": "punctuation.comment.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "comment.regexp",
          "patterns": [
            {
              "include": "#codetags"
            }
          ]
        },
        "double-three-regexp-conditional": {
          "begin": "(\\()\\?\\((\\w+(?:\\s+\\p{alnum}+)?|\\d+)\\)",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.conditional.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.conditional.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"\"\"))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.conditional.negative.regexp punctuation.parenthesis.conditional.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#double-three-regexp-expression"
            },
            {
              "include": "#comments-string-double-three"
            }
          ]
        },
        "double-three-regexp-expression": {
          "patterns": [
            {
              "include": "#regexp-base-expression"
            },
            {
              "include": "#double-three-regexp-character-set"
            },
            {
              "include": "#double-three-regexp-comments"
            },
            {
              "include": "#regexp-flags"
            },
            {
              "include": "#double-three-regexp-named-group"
            },
            {
              "include": "#regexp-backreference"
            },
            {
              "include": "#double-three-regexp-lookahead"
            },
            {
              "include": "#double-three-regexp-lookahead-negative"
            },
            {
              "include": "#double-three-regexp-lookbehind"
            },
            {
              "include": "#double-three-regexp-lookbehind-negative"
            },
            {
              "include": "#double-three-regexp-conditional"
            },
            {
              "include": "#double-three-regexp-parentheses-non-capturing"
            },
            {
              "include": "#double-three-regexp-parentheses"
            },
            {
              "include": "#comments-string-double-three"
            }
          ]
        },
        "double-three-regexp-lookahead": {
          "begin": "(\\()\\?=",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookahead.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookahead.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"\"\"))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookahead.regexp punctuation.parenthesis.lookahead.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#double-three-regexp-expression"
            },
            {
              "include": "#comments-string-double-three"
            }
          ]
        },
        "double-three-regexp-lookahead-negative": {
          "begin": "(\\()\\?!",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookahead.negative.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookahead.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"\"\"))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookahead.negative.regexp punctuation.parenthesis.lookahead.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#double-three-regexp-expression"
            },
            {
              "include": "#comments-string-double-three"
            }
          ]
        },
        "double-three-regexp-lookbehind": {
          "begin": "(\\()\\?<=",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookbehind.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookbehind.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"\"\"))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookbehind.regexp punctuation.parenthesis.lookbehind.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#double-three-regexp-expression"
            },
            {
              "include": "#comments-string-double-three"
            }
          ]
        },
        "double-three-regexp-lookbehind-negative": {
          "begin": "(\\()\\?<!",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookbehind.negative.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookbehind.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"\"\"))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookbehind.negative.regexp punctuation.parenthesis.lookbehind.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#double-three-regexp-expression"
            },
            {
              "include": "#comments-string-double-three"
            }
          ]
        },
        "double-three-regexp-named-group": {
          "begin": "(\\()(\\?P<\\w+(?:\\s+\\p{alnum}+)?>)",
          "beginCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.named.begin.regexp"
            },
            "2": {
              "name": "entity.name.tag.named.group.regexp"
            }
          },
          "end": "(\\)|(?=\"\"\"))",
          "endCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.named.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "meta.named.regexp",
          "patterns": [
            {
              "include": "#double-three-regexp-expression"
            },
            {
              "include": "#comments-string-double-three"
            }
          ]
        },
        "double-three-regexp-parentheses": {
          "begin": "\\(",
          "beginCaptures": {
            "0": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"\"\"))",
          "endCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#double-three-regexp-expression"
            },
            {
              "include": "#comments-string-double-three"
            }
          ]
        },
        "double-three-regexp-parentheses-non-capturing": {
          "begin": "\\(\\?:",
          "beginCaptures": {
            "0": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.non-capturing.begin.regexp"
            }
          },
          "end": "(\\)|(?=\"\"\"))",
          "endCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.non-capturing.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#double-three-regexp-expression"
            },
            {
              "include": "#comments-string-double-three"
            }
          ]
        },
        "ellipsis": {
          "match": "\\.\\.\\.",
          "name": "constant.other.ellipsis.python"
        },
        "escape-sequence": {
          "match": "\\\\(x\\h{2}|[0-7]{1,3}|[\"'\\\\abfnrtv])",
          "name": "constant.character.escape.python"
        },
        "escape-sequence-unicode": {
          "patterns": [
            {
              "match": "\\\\(u\\h{4}|U\\h{8}|N\\{[\\w\\s]+?})",
              "name": "constant.character.escape.python"
            }
          ]
        },
        "expression": {
          "patterns": [
            {
              "include": "#expression-base"
            },
            {
              "include": "#member-access"
            },
            {
              "match": "\\b([_[:alpha:]]\\w*)\\b"
            }
          ]
        },
        "expression-bare": {
          "patterns": [
            {
              "include": "#backticks"
            },
            {
              "include": "#illegal-anno"
            },
            {
              "include": "#literal"
            },
            {
              "include": "#regexp"
            },
            {
              "include": "#string"
            },
            {
              "include": "#lambda"
            },
            {
              "include": "#generator"
            },
            {
              "include": "#illegal-operator"
            },
            {
              "include": "#operator"
            },
            {
              "include": "#curly-braces"
            },
            {
              "include": "#item-access"
            },
            {
              "include": "#list"
            },
            {
              "include": "#odd-function-call"
            },
            {
              "include": "#round-braces"
            },
            {
              "include": "#function-call"
            },
            {
              "include": "#builtin-functions"
            },
            {
              "include": "#builtin-types"
            },
            {
              "include": "#builtin-exceptions"
            },
            {
              "include": "#magic-names"
            },
            {
              "include": "#special-names"
            },
            {
              "include": "#illegal-names"
            },
            {
              "include": "#special-variables"
            },
            {
              "include": "#ellipsis"
            },
            {
              "include": "#punctuation"
            },
            {
              "include": "#line-continuation"
            }
          ]
        },
        "expression-base": {
          "patterns": [
            {
              "include": "#comments"
            },
            {
              "include": "#expression-bare"
            },
            {
              "include": "#line-continuation"
            }
          ]
        },
        "f-expression": {
          "patterns": [
            {
              "include": "#expression-bare"
            },
            {
              "include": "#member-access"
            },
            {
              "match": "\\b([_[:alpha:]]\\w*)\\b"
            }
          ]
        },
        "fregexp-base-expression": {
          "patterns": [
            {
              "include": "#fregexp-quantifier"
            },
            {
              "include": "#fstring-formatting-braces"
            },
            {
              "match": "\\{.*?}"
            },
            {
              "include": "#regexp-base-common"
            }
          ]
        },
        "fregexp-quantifier": {
          "match": "\\{\\{(\\d+|\\d+,(\\d+)?|,\\d+)}}",
          "name": "keyword.operator.quantifier.regexp"
        },
        "fstring-fnorm-quoted-multi-line": {
          "begin": "\\b([Ff])([BUbu])?('''|\"\"\")",
          "beginCaptures": {
            "1": {
              "name": "string.interpolated.python string.quoted.multi.python storage.type.string.python"
            },
            "2": {
              "name": "invalid.illegal.prefix.python"
            },
            "3": {
              "name": "punctuation.definition.string.begin.python string.interpolated.python string.quoted.multi.python"
            }
          },
          "end": "(\\3)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python string.interpolated.python string.quoted.multi.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "meta.fstring.python",
          "patterns": [
            {
              "include": "#fstring-guts"
            },
            {
              "include": "#fstring-illegal-multi-brace"
            },
            {
              "include": "#fstring-multi-brace"
            },
            {
              "include": "#fstring-multi-core"
            }
          ]
        },
        "fstring-fnorm-quoted-single-line": {
          "begin": "\\b([Ff])([BUbu])?(([\"']))",
          "beginCaptures": {
            "1": {
              "name": "string.interpolated.python string.quoted.single.python storage.type.string.python"
            },
            "2": {
              "name": "invalid.illegal.prefix.python"
            },
            "3": {
              "name": "punctuation.definition.string.begin.python string.interpolated.python string.quoted.single.python"
            }
          },
          "end": "(\\3)|((?<!\\\\)\\n)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python string.interpolated.python string.quoted.single.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "meta.fstring.python",
          "patterns": [
            {
              "include": "#fstring-guts"
            },
            {
              "include": "#fstring-illegal-single-brace"
            },
            {
              "include": "#fstring-single-brace"
            },
            {
              "include": "#fstring-single-core"
            }
          ]
        },
        "fstring-formatting": {
          "patterns": [
            {
              "include": "#fstring-formatting-braces"
            },
            {
              "include": "#fstring-formatting-singe-brace"
            }
          ]
        },
        "fstring-formatting-braces": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "name": "constant.character.format.placeholder.other.python"
                },
                "2": {
                  "name": "invalid.illegal.brace.python"
                },
                "3": {
                  "name": "constant.character.format.placeholder.other.python"
                }
              },
              "match": "(\\{)(\\s*?)(})"
            },
            {
              "match": "(\\{\\{|}})",
              "name": "constant.character.escape.python"
            }
          ]
        },
        "fstring-formatting-singe-brace": {
          "match": "(}(?!}))",
          "name": "invalid.illegal.brace.python"
        },
        "fstring-guts": {
          "patterns": [
            {
              "include": "#escape-sequence-unicode"
            },
            {
              "include": "#escape-sequence"
            },
            {
              "include": "#string-line-continuation"
            },
            {
              "include": "#fstring-formatting"
            }
          ]
        },
        "fstring-illegal-multi-brace": {
          "patterns": [
            {
              "include": "#impossible"
            }
          ]
        },
        "fstring-illegal-single-brace": {
          "begin": "(\\{)(?=[^\\n}]*$\\n?)",
          "beginCaptures": {
            "1": {
              "name": "constant.character.format.placeholder.other.python"
            }
          },
          "end": "(})|(?=\\n)",
          "endCaptures": {
            "1": {
              "name": "constant.character.format.placeholder.other.python"
            }
          },
          "patterns": [
            {
              "include": "#fstring-terminator-single"
            },
            {
              "include": "#f-expression"
            }
          ]
        },
        "fstring-multi-brace": {
          "begin": "(\\{)",
          "beginCaptures": {
            "1": {
              "name": "constant.character.format.placeholder.other.python"
            }
          },
          "end": "(})",
          "endCaptures": {
            "1": {
              "name": "constant.character.format.placeholder.other.python"
            }
          },
          "patterns": [
            {
              "include": "#fstring-terminator-multi"
            },
            {
              "include": "#f-expression"
            }
          ]
        },
        "fstring-multi-core": {
          "match": "(.+?)($(\\n?)|(?=[\\\\{}]|'''|\"\"\"))|\\n",
          "name": "string.interpolated.python string.quoted.multi.python"
        },
        "fstring-normf-quoted-multi-line": {
          "begin": "\\b([BUbu])([Ff])('''|\"\"\")",
          "beginCaptures": {
            "1": {
              "name": "invalid.illegal.prefix.python"
            },
            "2": {
              "name": "string.interpolated.python string.quoted.multi.python storage.type.string.python"
            },
            "3": {
              "name": "punctuation.definition.string.begin.python string.quoted.multi.python"
            }
          },
          "end": "(\\3)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python string.interpolated.python string.quoted.multi.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "meta.fstring.python",
          "patterns": [
            {
              "include": "#fstring-guts"
            },
            {
              "include": "#fstring-illegal-multi-brace"
            },
            {
              "include": "#fstring-multi-brace"
            },
            {
              "include": "#fstring-multi-core"
            }
          ]
        },
        "fstring-normf-quoted-single-line": {
          "begin": "\\b([BUbu])([Ff])(([\"']))",
          "beginCaptures": {
            "1": {
              "name": "invalid.illegal.prefix.python"
            },
            "2": {
              "name": "string.interpolated.python string.quoted.single.python storage.type.string.python"
            },
            "3": {
              "name": "punctuation.definition.string.begin.python string.quoted.single.python"
            }
          },
          "end": "(\\3)|((?<!\\\\)\\n)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python string.interpolated.python string.quoted.single.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "meta.fstring.python",
          "patterns": [
            {
              "include": "#fstring-guts"
            },
            {
              "include": "#fstring-illegal-single-brace"
            },
            {
              "include": "#fstring-single-brace"
            },
            {
              "include": "#fstring-single-core"
            }
          ]
        },
        "fstring-raw-guts": {
          "patterns": [
            {
              "include": "#string-consume-escape"
            },
            {
              "include": "#fstring-formatting"
            }
          ]
        },
        "fstring-raw-multi-core": {
          "match": "(.+?)($(\\n?)|(?=[\\\\{}]|'''|\"\"\"))|\\n",
          "name": "string.interpolated.python string.quoted.raw.multi.python"
        },
        "fstring-raw-quoted-multi-line": {
          "begin": "\\b([Rr][Ff]|[Ff][Rr])('''|\"\"\")",
          "beginCaptures": {
            "1": {
              "name": "string.interpolated.python string.quoted.raw.multi.python storage.type.string.python"
            },
            "2": {
              "name": "punctuation.definition.string.begin.python string.quoted.raw.multi.python"
            }
          },
          "end": "(\\2)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python string.interpolated.python string.quoted.raw.multi.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "meta.fstring.python",
          "patterns": [
            {
              "include": "#fstring-raw-guts"
            },
            {
              "include": "#fstring-illegal-multi-brace"
            },
            {
              "include": "#fstring-multi-brace"
            },
            {
              "include": "#fstring-raw-multi-core"
            }
          ]
        },
        "fstring-raw-quoted-single-line": {
          "begin": "\\b([Rr][Ff]|[Ff][Rr])(([\"']))",
          "beginCaptures": {
            "1": {
              "name": "string.interpolated.python string.quoted.raw.single.python storage.type.string.python"
            },
            "2": {
              "name": "punctuation.definition.string.begin.python string.quoted.raw.single.python"
            }
          },
          "end": "(\\2)|((?<!\\\\)\\n)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python string.interpolated.python string.quoted.raw.single.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "meta.fstring.python",
          "patterns": [
            {
              "include": "#fstring-raw-guts"
            },
            {
              "include": "#fstring-illegal-single-brace"
            },
            {
              "include": "#fstring-single-brace"
            },
            {
              "include": "#fstring-raw-single-core"
            }
          ]
        },
        "fstring-raw-single-core": {
          "match": "(.+?)($(\\n?)|(?=[\\\\{}]|([\"'])|((?<!\\\\)\\n)))|\\n",
          "name": "string.interpolated.python string.quoted.raw.single.python"
        },
        "fstring-single-brace": {
          "begin": "(\\{)",
          "beginCaptures": {
            "1": {
              "name": "constant.character.format.placeholder.other.python"
            }
          },
          "end": "(})|(?=\\n)",
          "endCaptures": {
            "1": {
              "name": "constant.character.format.placeholder.other.python"
            }
          },
          "patterns": [
            {
              "include": "#fstring-terminator-single"
            },
            {
              "include": "#f-expression"
            }
          ]
        },
        "fstring-single-core": {
          "match": "(.+?)($(\\n?)|(?=[\\\\{}]|([\"'])|((?<!\\\\)\\n)))|\\n",
          "name": "string.interpolated.python string.quoted.single.python"
        },
        "fstring-terminator-multi": {
          "patterns": [
            {
              "match": "(=(![ars])?)(?=})",
              "name": "storage.type.format.python"
            },
            {
              "match": "(=?![ars])(?=})",
              "name": "storage.type.format.python"
            },
            {
              "captures": {
                "1": {
                  "name": "storage.type.format.python"
                },
                "2": {
                  "name": "storage.type.format.python"
                }
              },
              "match": "(=?(?:![ars])?)(:\\w?[<=>^]?[- +]?#?\\d*,?(\\.\\d+)?[%EFGXb-gnosx]?)(?=})"
            },
            {
              "include": "#fstring-terminator-multi-tail"
            }
          ]
        },
        "fstring-terminator-multi-tail": {
          "begin": "(=?(?:![ars])?)(:)(?=.*?\\{)",
          "beginCaptures": {
            "1": {
              "name": "storage.type.format.python"
            },
            "2": {
              "name": "storage.type.format.python"
            }
          },
          "end": "(?=})",
          "patterns": [
            {
              "include": "#fstring-illegal-multi-brace"
            },
            {
              "include": "#fstring-multi-brace"
            },
            {
              "match": "([%EFGXb-gnosx])(?=})",
              "name": "storage.type.format.python"
            },
            {
              "match": "(\\.\\d+)",
              "name": "storage.type.format.python"
            },
            {
              "match": "(,)",
              "name": "storage.type.format.python"
            },
            {
              "match": "(\\d+)",
              "name": "storage.type.format.python"
            },
            {
              "match": "(#)",
              "name": "storage.type.format.python"
            },
            {
              "match": "([- +])",
              "name": "storage.type.format.python"
            },
            {
              "match": "([<=>^])",
              "name": "storage.type.format.python"
            },
            {
              "match": "(\\w)",
              "name": "storage.type.format.python"
            }
          ]
        },
        "fstring-terminator-single": {
          "patterns": [
            {
              "match": "(=(![ars])?)(?=})",
              "name": "storage.type.format.python"
            },
            {
              "match": "(=?![ars])(?=})",
              "name": "storage.type.format.python"
            },
            {
              "captures": {
                "1": {
                  "name": "storage.type.format.python"
                },
                "2": {
                  "name": "storage.type.format.python"
                }
              },
              "match": "(=?(?:![ars])?)(:\\w?[<=>^]?[- +]?#?\\d*,?(\\.\\d+)?[%EFGXb-gnosx]?)(?=})"
            },
            {
              "include": "#fstring-terminator-single-tail"
            }
          ]
        },
        "fstring-terminator-single-tail": {
          "begin": "(=?(?:![ars])?)(:)(?=.*?\\{)",
          "beginCaptures": {
            "1": {
              "name": "storage.type.format.python"
            },
            "2": {
              "name": "storage.type.format.python"
            }
          },
          "end": "(?=})|(?=\\n)",
          "patterns": [
            {
              "include": "#fstring-illegal-single-brace"
            },
            {
              "include": "#fstring-single-brace"
            },
            {
              "match": "([%EFGXb-gnosx])(?=})",
              "name": "storage.type.format.python"
            },
            {
              "match": "(\\.\\d+)",
              "name": "storage.type.format.python"
            },
            {
              "match": "(,)",
              "name": "storage.type.format.python"
            },
            {
              "match": "(\\d+)",
              "name": "storage.type.format.python"
            },
            {
              "match": "(#)",
              "name": "storage.type.format.python"
            },
            {
              "match": "([- +])",
              "name": "storage.type.format.python"
            },
            {
              "match": "([<=>^])",
              "name": "storage.type.format.python"
            },
            {
              "match": "(\\w)",
              "name": "storage.type.format.python"
            }
          ]
        },
        "function-arguments": {
          "begin": "(\\()",
          "beginCaptures": {
            "1": {
              "name": "punctuation.definition.arguments.begin.python"
            }
          },
          "contentName": "meta.function-call.arguments.python",
          "end": "(?=\\))(?!\\)\\s*\\()",
          "patterns": [
            {
              "match": "(,)",
              "name": "punctuation.separator.arguments.python"
            },
            {
              "captures": {
                "1": {
                  "name": "keyword.operator.unpacking.arguments.python"
                }
              },
              "match": "(?:(?<=[(,])|^)\\s*(\\*{1,2})"
            },
            {
              "include": "#lambda-incomplete"
            },
            {
              "include": "#illegal-names"
            },
            {
              "captures": {
                "1": {
                  "name": "variable.parameter.function-call.python"
                },
                "2": {
                  "name": "keyword.operator.assignment.python"
                }
              },
              "match": "\\b([_[:alpha:]]\\w*)\\s*(=)(?!=)"
            },
            {
              "match": "=(?!=)",
              "name": "keyword.operator.assignment.python"
            },
            {
              "include": "#expression"
            },
            {
              "captures": {
                "1": {
                  "name": "punctuation.definition.arguments.end.python"
                },
                "2": {
                  "name": "punctuation.definition.arguments.begin.python"
                }
              },
              "match": "\\s*(\\))\\s*(\\()"
            }
          ]
        },
        "function-call": {
          "begin": "\\b(?=([_[:alpha:]]\\w*)\\s*(\\())",
          "end": "(\\))",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.arguments.end.python"
            }
          },
          "name": "meta.function-call.python",
          "patterns": [
            {
              "include": "#special-variables"
            },
            {
              "include": "#function-name"
            },
            {
              "include": "#function-arguments"
            }
          ]
        },
        "function-declaration": {
          "begin": "\\s*(?:\\b(async)\\s+)?\\b(def)\\s+(?=[_[:alpha:]]\\p{word}*\\s*\\()",
          "beginCaptures": {
            "1": {
              "name": "storage.type.function.async.python"
            },
            "2": {
              "name": "storage.type.function.python"
            }
          },
          "end": "(:|(?=[\\n\"#']))",
          "endCaptures": {
            "1": {
              "name": "punctuation.section.function.begin.python"
            }
          },
          "name": "meta.function.python",
          "patterns": [
            {
              "include": "#function-def-name"
            },
            {
              "include": "#parameters"
            },
            {
              "include": "#line-continuation"
            },
            {
              "include": "#return-annotation"
            }
          ]
        },
        "function-def-name": {
          "patterns": [
            {
              "include": "#illegal-object-name"
            },
            {
              "include": "#builtin-possible-callables"
            },
            {
              "match": "\\b([_[:alpha:]]\\w*)\\b",
              "name": "entity.name.function.python"
            }
          ]
        },
        "function-name": {
          "patterns": [
            {
              "include": "#builtin-possible-callables"
            },
            {
              "match": "\\b([_[:alpha:]]\\w*)\\b",
              "name": "meta.function-call.generic.python"
            }
          ]
        },
        "generator": {
          "begin": "\\bfor\\b",
          "beginCaptures": {
            "0": {
              "name": "keyword.control.flow.python"
            }
          },
          "end": "\\bin\\b",
          "endCaptures": {
            "0": {
              "name": "keyword.control.flow.python"
            }
          },
          "patterns": [
            {
              "include": "#expression"
            }
          ]
        },
        "illegal-anno": {
          "match": "->",
          "name": "invalid.illegal.annotation.python"
        },
        "illegal-names": {
          "captures": {
            "1": {
              "name": "keyword.control.flow.python"
            },
            "2": {
              "name": "keyword.control.import.python"
            }
          },
          "match": "\\b(?:(and|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|in|is|(?<=\\.)lambda|lambda(?=\\s*[.=])|nonlocal|not|or|pass|raise|return|try|while|with|yield)|(as|import))\\b"
        },
        "illegal-object-name": {
          "match": "\\b(True|False|None)\\b",
          "name": "keyword.illegal.name.python"
        },
        "illegal-operator": {
          "patterns": [
            {
              "match": "&&|\\|\\||--|\\+\\+",
              "name": "invalid.illegal.operator.python"
            },
            {
              "match": "[$?]",
              "name": "invalid.illegal.operator.python"
            },
            {
              "match": "!\\b",
              "name": "invalid.illegal.operator.python"
            }
          ]
        },
        "import": {
          "patterns": [
            {
              "begin": "\\b(?<!\\.)(from)\\b(?=.+import)",
              "beginCaptures": {
                "1": {
                  "name": "keyword.control.import.python"
                }
              },
              "end": "$|(?=import)",
              "patterns": [
                {
                  "match": "\\.+",
                  "name": "punctuation.separator.period.python"
                },
                {
                  "include": "#expression"
                }
              ]
            },
            {
              "begin": "\\b(?<!\\.)(import)\\b",
              "beginCaptures": {
                "1": {
                  "name": "keyword.control.import.python"
                }
              },
              "end": "$",
              "patterns": [
                {
                  "match": "\\b(?<!\\.)as\\b",
                  "name": "keyword.control.import.python"
                },
                {
                  "include": "#expression"
                }
              ]
            }
          ]
        },
        "impossible": {
          "match": "$.^"
        },
        "inheritance-identifier": {
          "captures": {
            "1": {
              "name": "entity.other.inherited-class.python"
            }
          },
          "match": "\\b([_[:alpha:]]\\w*)\\b"
        },
        "inheritance-name": {
          "patterns": [
            {
              "include": "#lambda-incomplete"
            },
            {
              "include": "#builtin-possible-callables"
            },
            {
              "include": "#inheritance-identifier"
            }
          ]
        },
        "item-access": {
          "patterns": [
            {
              "begin": "\\b(?=[_[:alpha:]]\\w*\\s*\\[)",
              "end": "(])",
              "endCaptures": {
                "1": {
                  "name": "punctuation.definition.arguments.end.python"
                }
              },
              "name": "meta.item-access.python",
              "patterns": [
                {
                  "include": "#item-name"
                },
                {
                  "include": "#item-index"
                },
                {
                  "include": "#expression"
                }
              ]
            }
          ]
        },
        "item-index": {
          "begin": "(\\[)",
          "beginCaptures": {
            "1": {
              "name": "punctuation.definition.arguments.begin.python"
            }
          },
          "contentName": "meta.item-access.arguments.python",
          "end": "(?=])",
          "patterns": [
            {
              "match": ":",
              "name": "punctuation.separator.slice.python"
            },
            {
              "include": "#expression"
            }
          ]
        },
        "item-name": {
          "patterns": [
            {
              "include": "#special-variables"
            },
            {
              "include": "#builtin-functions"
            },
            {
              "include": "#special-names"
            },
            {
              "match": "\\b([_[:alpha:]]\\w*)\\b",
              "name": "meta.indexed-name.python"
            }
          ]
        },
        "lambda": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "name": "keyword.control.flow.python"
                }
              },
              "match": "((?<=\\.)lambda|lambda(?=\\s*[.=]))"
            },
            {
              "captures": {
                "1": {
                  "name": "storage.type.function.lambda.python"
                }
              },
              "match": "\\b(lambda)\\s*?(?=[\\n,]|$)"
            },
            {
              "begin": "\\b(lambda)\\b",
              "beginCaptures": {
                "1": {
                  "name": "storage.type.function.lambda.python"
                }
              },
              "contentName": "meta.function.lambda.parameters.python",
              "end": "(:)|(\\n)",
              "endCaptures": {
                "1": {
                  "name": "punctuation.section.function.lambda.begin.python"
                }
              },
              "name": "meta.lambda-function.python",
              "patterns": [
                {
                  "match": "/",
                  "name": "keyword.operator.positional.parameter.python"
                },
                {
                  "match": "(\\*\\*?)",
                  "name": "keyword.operator.unpacking.parameter.python"
                },
                {
                  "include": "#lambda-nested-incomplete"
                },
                {
                  "include": "#illegal-names"
                },
                {
                  "captures": {
                    "1": {
                      "name": "variable.parameter.function.language.python"
                    },
                    "2": {
                      "name": "punctuation.separator.parameters.python"
                    }
                  },
                  "match": "([_[:alpha:]]\\w*)\\s*(?:(,)|(?=:|$))"
                },
                {
                  "include": "#comments"
                },
                {
                  "include": "#backticks"
                },
                {
                  "include": "#illegal-anno"
                },
                {
                  "include": "#lambda-parameter-with-default"
                },
                {
                  "include": "#line-continuation"
                },
                {
                  "include": "#illegal-operator"
                }
              ]
            }
          ]
        },
        "lambda-incomplete": {
          "match": "\\blambda(?=\\s*[),])",
          "name": "storage.type.function.lambda.python"
        },
        "lambda-nested-incomplete": {
          "match": "\\blambda(?=\\s*[),:])",
          "name": "storage.type.function.lambda.python"
        },
        "lambda-parameter-with-default": {
          "begin": "\\b([_[:alpha:]]\\w*)\\s*(=)",
          "beginCaptures": {
            "1": {
              "name": "variable.parameter.function.language.python"
            },
            "2": {
              "name": "keyword.operator.python"
            }
          },
          "end": "(,)|(?=:|$)",
          "endCaptures": {
            "1": {
              "name": "punctuation.separator.parameters.python"
            }
          },
          "patterns": [
            {
              "include": "#expression"
            }
          ]
        },
        "line-continuation": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "name": "punctuation.separator.continuation.line.python"
                },
                "2": {
                  "name": "invalid.illegal.line.continuation.python"
                }
              },
              "match": "(\\\\)\\s*(\\S.*$\\n?)"
            },
            {
              "begin": "(\\\\)\\s*$\\n?",
              "beginCaptures": {
                "1": {
                  "name": "punctuation.separator.continuation.line.python"
                }
              },
              "end": "(?=^\\s*$)|(?!(\\s*[Rr]?('''|\"\"\"|[\"']))|\\G()$)",
              "patterns": [
                {
                  "include": "#regexp"
                },
                {
                  "include": "#string"
                }
              ]
            }
          ]
        },
        "list": {
          "begin": "\\[",
          "beginCaptures": {
            "0": {
              "name": "punctuation.definition.list.begin.python"
            }
          },
          "end": "]",
          "endCaptures": {
            "0": {
              "name": "punctuation.definition.list.end.python"
            }
          },
          "patterns": [
            {
              "include": "#expression"
            }
          ]
        },
        "literal": {
          "patterns": [
            {
              "match": "\\b(True|False|None|NotImplemented|Ellipsis)\\b",
              "name": "constant.language.python"
            },
            {
              "include": "#number"
            }
          ]
        },
        "loose-default": {
          "begin": "(=)",
          "beginCaptures": {
            "1": {
              "name": "keyword.operator.python"
            }
          },
          "end": "(,)|(?=\\))",
          "endCaptures": {
            "1": {
              "name": "punctuation.separator.parameters.python"
            }
          },
          "patterns": [
            {
              "include": "#expression"
            }
          ]
        },
        "magic-function-names": {
          "captures": {
            "1": {
              "name": "support.function.magic.python"
            }
          },
          "match": "\\b(__(?:abs|add|aenter|aexit|aiter|and|anext|await|bool|call|ceil|class_getitem|cmp|coerce|complex|contains|copy|deepcopy|del|delattr|delete|delitem|delslice|dir|div|divmod|enter|eq|exit|float|floor|floordiv|format|get??|getattr|getattribute|getinitargs|getitem|getnewargs|getslice|getstate|gt|hash|hex|iadd|iand|idiv|ifloordiv||ilshift|imod|imul|index|init|instancecheck|int|invert|ior|ipow|irshift|isub|iter|itruediv|ixor|len??|long|lshift|lt|missing|mod|mul|neg??|new|next|nonzero|oct|or|pos|pow|radd|rand|rdiv|rdivmod|reduce|reduce_ex|repr|reversed|rfloordiv||rlshift|rmod|rmul|ror|round|rpow|rrshift|rshift|rsub|rtruediv|rxor|set|setattr|setitem|set_name|setslice|setstate|sizeof|str|sub|subclasscheck|truediv|trunc|unicode|xor|matmul|rmatmul|imatmul|init_subclass|set_name|fspath|bytes|prepare|length_hint)__)\\b"
        },
        "magic-names": {
          "patterns": [
            {
              "include": "#magic-function-names"
            },
            {
              "include": "#magic-variable-names"
            }
          ]
        },
        "magic-variable-names": {
          "captures": {
            "1": {
              "name": "support.variable.magic.python"
            }
          },
          "match": "\\b(__(?:all|annotations|bases|builtins|class|closure|code|debug|defaults|dict|doc|file|func|globals|kwdefaults|match_args|members|metaclass|methods|module|mro|mro_entries|name|qualname|post_init|self|signature|slots|subclasses|version|weakref|wrapped|classcell|spec|path|package|future|traceback)__)\\b"
        },
        "member-access": {
          "begin": "(\\.)\\s*(?!\\.)",
          "beginCaptures": {
            "1": {
              "name": "punctuation.separator.period.python"
            }
          },
          "end": "(?<=\\S)(?=\\W)|(^|(?<=\\s))(?=[^\\\\\\w\\s])|$",
          "name": "meta.member.access.python",
          "patterns": [
            {
              "include": "#function-call"
            },
            {
              "include": "#member-access-base"
            },
            {
              "include": "#member-access-attribute"
            }
          ]
        },
        "member-access-attribute": {
          "match": "\\b([_[:alpha:]]\\w*)\\b",
          "name": "meta.attribute.python"
        },
        "member-access-base": {
          "patterns": [
            {
              "include": "#magic-names"
            },
            {
              "include": "#illegal-names"
            },
            {
              "include": "#illegal-object-name"
            },
            {
              "include": "#special-names"
            },
            {
              "include": "#line-continuation"
            },
            {
              "include": "#item-access"
            }
          ]
        },
        "member-access-class": {
          "begin": "(\\.)\\s*(?!\\.)",
          "beginCaptures": {
            "1": {
              "name": "punctuation.separator.period.python"
            }
          },
          "end": "(?<=\\S)(?=\\W)|$",
          "name": "meta.member.access.python",
          "patterns": [
            {
              "include": "#call-wrapper-inheritance"
            },
            {
              "include": "#member-access-base"
            },
            {
              "include": "#inheritance-identifier"
            }
          ]
        },
        "number": {
          "name": "constant.numeric.python",
          "patterns": [
            {
              "include": "#number-float"
            },
            {
              "include": "#number-dec"
            },
            {
              "include": "#number-hex"
            },
            {
              "include": "#number-oct"
            },
            {
              "include": "#number-bin"
            },
            {
              "include": "#number-long"
            },
            {
              "match": "\\b[0-9]+\\w+",
              "name": "invalid.illegal.name.python"
            }
          ]
        },
        "number-bin": {
          "captures": {
            "1": {
              "name": "storage.type.number.python"
            }
          },
          "match": "(?<![.\\w])(0[Bb])(_?[01])+\\b",
          "name": "constant.numeric.bin.python"
        },
        "number-dec": {
          "captures": {
            "1": {
              "name": "storage.type.imaginary.number.python"
            },
            "2": {
              "name": "invalid.illegal.dec.python"
            }
          },
          "match": "(?<![.\\w])(?:[1-9](?:_?[0-9])*|0+|[0-9](?:_?[0-9])*([Jj])|0([0-9]+)(?![.Ee]))\\b",
          "name": "constant.numeric.dec.python"
        },
        "number-float": {
          "captures": {
            "1": {
              "name": "storage.type.imaginary.number.python"
            }
          },
          "match": "(?<!\\w)(?:(?:\\.[0-9](?:_?[0-9])*|[0-9](?:_?[0-9])*\\.[0-9](?:_?[0-9])*|[0-9](?:_?[0-9])*\\.)(?:[Ee][-+]?[0-9](?:_?[0-9])*)?|[0-9](?:_?[0-9])*[Ee][-+]?[0-9](?:_?[0-9])*)([Jj])?\\b",
          "name": "constant.numeric.float.python"
        },
        "number-hex": {
          "captures": {
            "1": {
              "name": "storage.type.number.python"
            }
          },
          "match": "(?<![.\\w])(0[Xx])(_?\\h)+\\b",
          "name": "constant.numeric.hex.python"
        },
        "number-long": {
          "captures": {
            "2": {
              "name": "storage.type.number.python"
            }
          },
          "match": "(?<![.\\w])([1-9][0-9]*|0)([Ll])\\b",
          "name": "constant.numeric.bin.python"
        },
        "number-oct": {
          "captures": {
            "1": {
              "name": "storage.type.number.python"
            }
          },
          "match": "(?<![.\\w])(0[Oo])(_?[0-7])+\\b",
          "name": "constant.numeric.oct.python"
        },
        "odd-function-call": {
          "begin": "(?<=[])])\\s*(?=\\()",
          "end": "(\\))",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.arguments.end.python"
            }
          },
          "patterns": [
            {
              "include": "#function-arguments"
            }
          ]
        },
        "operator": {
          "captures": {
            "1": {
              "name": "keyword.operator.logical.python"
            },
            "2": {
              "name": "keyword.control.flow.python"
            },
            "3": {
              "name": "keyword.operator.bitwise.python"
            },
            "4": {
              "name": "keyword.operator.arithmetic.python"
            },
            "5": {
              "name": "keyword.operator.comparison.python"
            },
            "6": {
              "name": "keyword.operator.assignment.python"
            }
          },
          "match": "\\b(?<!\\.)(?:(and|or|not|in|is)|(for|if|else|await|yield(?:\\s+from)?))(?!\\s*:)\\b|(<<|>>|[\\&^|~])|(\\*\\*|[-%*+]|//|[/@])|(!=|==|>=|<=|[<>])|(:=)"
        },
        "parameter-special": {
          "captures": {
            "1": {
              "name": "variable.parameter.function.language.python"
            },
            "2": {
              "name": "variable.parameter.function.language.special.self.python"
            },
            "3": {
              "name": "variable.parameter.function.language.special.cls.python"
            },
            "4": {
              "name": "punctuation.separator.parameters.python"
            }
          },
          "match": "\\b((self)|(cls))\\b\\s*(?:(,)|(?=\\)))"
        },
        "parameters": {
          "begin": "(\\()",
          "beginCaptures": {
            "1": {
              "name": "punctuation.definition.parameters.begin.python"
            }
          },
          "end": "(\\))",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.parameters.end.python"
            }
          },
          "name": "meta.function.parameters.python",
          "patterns": [
            {
              "match": "/",
              "name": "keyword.operator.positional.parameter.python"
            },
            {
              "match": "(\\*\\*?)",
              "name": "keyword.operator.unpacking.parameter.python"
            },
            {
              "include": "#lambda-incomplete"
            },
            {
              "include": "#illegal-names"
            },
            {
              "include": "#illegal-object-name"
            },
            {
              "include": "#parameter-special"
            },
            {
              "captures": {
                "1": {
                  "name": "variable.parameter.function.language.python"
                },
                "2": {
                  "name": "punctuation.separator.parameters.python"
                }
              },
              "match": "([_[:alpha:]]\\w*)\\s*(?:(,)|(?=[\\n#)=]))"
            },
            {
              "include": "#comments"
            },
            {
              "include": "#loose-default"
            },
            {
              "include": "#annotated-parameter"
            }
          ]
        },
        "punctuation": {
          "patterns": [
            {
              "match": ":",
              "name": "punctuation.separator.colon.python"
            },
            {
              "match": ",",
              "name": "punctuation.separator.element.python"
            }
          ]
        },
        "regexp": {
          "patterns": [
            {
              "include": "#regexp-single-three-line"
            },
            {
              "include": "#regexp-double-three-line"
            },
            {
              "include": "#regexp-single-one-line"
            },
            {
              "include": "#regexp-double-one-line"
            }
          ]
        },
        "regexp-backreference": {
          "captures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.backreference.named.begin.regexp"
            },
            "2": {
              "name": "entity.name.tag.named.backreference.regexp"
            },
            "3": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.backreference.named.end.regexp"
            }
          },
          "match": "(\\()(\\?P=\\w+(?:\\s+\\p{alnum}+)?)(\\))",
          "name": "meta.backreference.named.regexp"
        },
        "regexp-backreference-number": {
          "captures": {
            "1": {
              "name": "entity.name.tag.backreference.regexp"
            }
          },
          "match": "(\\\\[1-9]\\d?)",
          "name": "meta.backreference.regexp"
        },
        "regexp-base-common": {
          "patterns": [
            {
              "match": "\\.",
              "name": "support.other.match.any.regexp"
            },
            {
              "match": "\\^",
              "name": "support.other.match.begin.regexp"
            },
            {
              "match": "\\$",
              "name": "support.other.match.end.regexp"
            },
            {
              "match": "[*+?]\\??",
              "name": "keyword.operator.quantifier.regexp"
            },
            {
              "match": "\\|",
              "name": "keyword.operator.disjunction.regexp"
            },
            {
              "include": "#regexp-escape-sequence"
            }
          ]
        },
        "regexp-base-expression": {
          "patterns": [
            {
              "include": "#regexp-quantifier"
            },
            {
              "include": "#regexp-base-common"
            }
          ]
        },
        "regexp-charecter-set-escapes": {
          "patterns": [
            {
              "match": "\\\\[\\\\abfnrtv]",
              "name": "constant.character.escape.regexp"
            },
            {
              "include": "#regexp-escape-special"
            },
            {
              "match": "\\\\([0-7]{1,3})",
              "name": "constant.character.escape.regexp"
            },
            {
              "include": "#regexp-escape-character"
            },
            {
              "include": "#regexp-escape-unicode"
            },
            {
              "include": "#regexp-escape-catchall"
            }
          ]
        },
        "regexp-double-one-line": {
          "begin": "\\b(([Uu]r)|([Bb]r)|(r[Bb]?))(\")",
          "beginCaptures": {
            "2": {
              "name": "invalid.deprecated.prefix.python"
            },
            "3": {
              "name": "storage.type.string.python"
            },
            "4": {
              "name": "storage.type.string.python"
            },
            "5": {
              "name": "punctuation.definition.string.begin.python"
            }
          },
          "end": "(\")|(?<!\\\\)(\\n)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "string.regexp.quoted.single.python",
          "patterns": [
            {
              "include": "#double-one-regexp-expression"
            }
          ]
        },
        "regexp-double-three-line": {
          "begin": "\\b(([Uu]r)|([Bb]r)|(r[Bb]?))(\"\"\")",
          "beginCaptures": {
            "2": {
              "name": "invalid.deprecated.prefix.python"
            },
            "3": {
              "name": "storage.type.string.python"
            },
            "4": {
              "name": "storage.type.string.python"
            },
            "5": {
              "name": "punctuation.definition.string.begin.python"
            }
          },
          "end": "(\"\"\")",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "string.regexp.quoted.multi.python",
          "patterns": [
            {
              "include": "#double-three-regexp-expression"
            }
          ]
        },
        "regexp-escape-catchall": {
          "match": "\\\\(.|\\n)",
          "name": "constant.character.escape.regexp"
        },
        "regexp-escape-character": {
          "match": "\\\\(x\\h{2}|0[0-7]{1,2}|[0-7]{3})",
          "name": "constant.character.escape.regexp"
        },
        "regexp-escape-sequence": {
          "patterns": [
            {
              "include": "#regexp-escape-special"
            },
            {
              "include": "#regexp-escape-character"
            },
            {
              "include": "#regexp-escape-unicode"
            },
            {
              "include": "#regexp-backreference-number"
            },
            {
              "include": "#regexp-escape-catchall"
            }
          ]
        },
        "regexp-escape-special": {
          "match": "\\\\([ABDSWZbdsw])",
          "name": "support.other.escape.special.regexp"
        },
        "regexp-escape-unicode": {
          "match": "\\\\(u\\h{4}|U\\h{8})",
          "name": "constant.character.unicode.regexp"
        },
        "regexp-flags": {
          "match": "\\(\\?[Laimsux]+\\)",
          "name": "storage.modifier.flag.regexp"
        },
        "regexp-quantifier": {
          "match": "\\{(\\d+|\\d+,(\\d+)?|,\\d+)}",
          "name": "keyword.operator.quantifier.regexp"
        },
        "regexp-single-one-line": {
          "begin": "\\b(([Uu]r)|([Bb]r)|(r[Bb]?))(')",
          "beginCaptures": {
            "2": {
              "name": "invalid.deprecated.prefix.python"
            },
            "3": {
              "name": "storage.type.string.python"
            },
            "4": {
              "name": "storage.type.string.python"
            },
            "5": {
              "name": "punctuation.definition.string.begin.python"
            }
          },
          "end": "(')|(?<!\\\\)(\\n)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "string.regexp.quoted.single.python",
          "patterns": [
            {
              "include": "#single-one-regexp-expression"
            }
          ]
        },
        "regexp-single-three-line": {
          "begin": "\\b(([Uu]r)|([Bb]r)|(r[Bb]?))(''')",
          "beginCaptures": {
            "2": {
              "name": "invalid.deprecated.prefix.python"
            },
            "3": {
              "name": "storage.type.string.python"
            },
            "4": {
              "name": "storage.type.string.python"
            },
            "5": {
              "name": "punctuation.definition.string.begin.python"
            }
          },
          "end": "(''')",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "string.regexp.quoted.multi.python",
          "patterns": [
            {
              "include": "#single-three-regexp-expression"
            }
          ]
        },
        "return-annotation": {
          "begin": "(->)",
          "beginCaptures": {
            "1": {
              "name": "punctuation.separator.annotation.result.python"
            }
          },
          "end": "(?=:)",
          "patterns": [
            {
              "include": "#expression"
            }
          ]
        },
        "round-braces": {
          "begin": "\\(",
          "beginCaptures": {
            "0": {
              "name": "punctuation.parenthesis.begin.python"
            }
          },
          "end": "\\)",
          "endCaptures": {
            "0": {
              "name": "punctuation.parenthesis.end.python"
            }
          },
          "patterns": [
            {
              "include": "#expression"
            }
          ]
        },
        "semicolon": {
          "patterns": [
            {
              "match": ";$",
              "name": "invalid.deprecated.semicolon.python"
            }
          ]
        },
        "single-one-regexp-character-set": {
          "patterns": [
            {
              "match": "\\[\\^?](?!.*?])"
            },
            {
              "begin": "(\\[)(\\^)?(])?",
              "beginCaptures": {
                "1": {
                  "name": "punctuation.character.set.begin.regexp constant.other.set.regexp"
                },
                "2": {
                  "name": "keyword.operator.negation.regexp"
                },
                "3": {
                  "name": "constant.character.set.regexp"
                }
              },
              "end": "(]|(?='))|((?=(?<!\\\\)\\n))",
              "endCaptures": {
                "1": {
                  "name": "punctuation.character.set.end.regexp constant.other.set.regexp"
                },
                "2": {
                  "name": "invalid.illegal.newline.python"
                }
              },
              "name": "meta.character.set.regexp",
              "patterns": [
                {
                  "include": "#regexp-charecter-set-escapes"
                },
                {
                  "match": "\\N",
                  "name": "constant.character.set.regexp"
                }
              ]
            }
          ]
        },
        "single-one-regexp-comments": {
          "begin": "\\(\\?#",
          "beginCaptures": {
            "0": {
              "name": "punctuation.comment.begin.regexp"
            }
          },
          "end": "(\\)|(?='))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "punctuation.comment.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "comment.regexp",
          "patterns": [
            {
              "include": "#codetags"
            }
          ]
        },
        "single-one-regexp-conditional": {
          "begin": "(\\()\\?\\((\\w+(?:\\s+\\p{alnum}+)?|\\d+)\\)",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.conditional.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.conditional.begin.regexp"
            }
          },
          "end": "(\\)|(?='))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.conditional.negative.regexp punctuation.parenthesis.conditional.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#single-one-regexp-expression"
            }
          ]
        },
        "single-one-regexp-expression": {
          "patterns": [
            {
              "include": "#regexp-base-expression"
            },
            {
              "include": "#single-one-regexp-character-set"
            },
            {
              "include": "#single-one-regexp-comments"
            },
            {
              "include": "#regexp-flags"
            },
            {
              "include": "#single-one-regexp-named-group"
            },
            {
              "include": "#regexp-backreference"
            },
            {
              "include": "#single-one-regexp-lookahead"
            },
            {
              "include": "#single-one-regexp-lookahead-negative"
            },
            {
              "include": "#single-one-regexp-lookbehind"
            },
            {
              "include": "#single-one-regexp-lookbehind-negative"
            },
            {
              "include": "#single-one-regexp-conditional"
            },
            {
              "include": "#single-one-regexp-parentheses-non-capturing"
            },
            {
              "include": "#single-one-regexp-parentheses"
            }
          ]
        },
        "single-one-regexp-lookahead": {
          "begin": "(\\()\\?=",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookahead.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookahead.begin.regexp"
            }
          },
          "end": "(\\)|(?='))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookahead.regexp punctuation.parenthesis.lookahead.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#single-one-regexp-expression"
            }
          ]
        },
        "single-one-regexp-lookahead-negative": {
          "begin": "(\\()\\?!",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookahead.negative.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookahead.begin.regexp"
            }
          },
          "end": "(\\)|(?='))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookahead.negative.regexp punctuation.parenthesis.lookahead.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#single-one-regexp-expression"
            }
          ]
        },
        "single-one-regexp-lookbehind": {
          "begin": "(\\()\\?<=",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookbehind.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookbehind.begin.regexp"
            }
          },
          "end": "(\\)|(?='))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookbehind.regexp punctuation.parenthesis.lookbehind.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#single-one-regexp-expression"
            }
          ]
        },
        "single-one-regexp-lookbehind-negative": {
          "begin": "(\\()\\?<!",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookbehind.negative.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookbehind.begin.regexp"
            }
          },
          "end": "(\\)|(?='))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookbehind.negative.regexp punctuation.parenthesis.lookbehind.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#single-one-regexp-expression"
            }
          ]
        },
        "single-one-regexp-named-group": {
          "begin": "(\\()(\\?P<\\w+(?:\\s+\\p{alnum}+)?>)",
          "beginCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.named.begin.regexp"
            },
            "2": {
              "name": "entity.name.tag.named.group.regexp"
            }
          },
          "end": "(\\)|(?='))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.named.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "meta.named.regexp",
          "patterns": [
            {
              "include": "#single-one-regexp-expression"
            }
          ]
        },
        "single-one-regexp-parentheses": {
          "begin": "\\(",
          "beginCaptures": {
            "0": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.begin.regexp"
            }
          },
          "end": "(\\)|(?='))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#single-one-regexp-expression"
            }
          ]
        },
        "single-one-regexp-parentheses-non-capturing": {
          "begin": "\\(\\?:",
          "beginCaptures": {
            "0": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.non-capturing.begin.regexp"
            }
          },
          "end": "(\\)|(?='))|((?=(?<!\\\\)\\n))",
          "endCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.non-capturing.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#single-one-regexp-expression"
            }
          ]
        },
        "single-three-regexp-character-set": {
          "patterns": [
            {
              "match": "\\[\\^?](?!.*?])"
            },
            {
              "begin": "(\\[)(\\^)?(])?",
              "beginCaptures": {
                "1": {
                  "name": "punctuation.character.set.begin.regexp constant.other.set.regexp"
                },
                "2": {
                  "name": "keyword.operator.negation.regexp"
                },
                "3": {
                  "name": "constant.character.set.regexp"
                }
              },
              "end": "(]|(?='''))",
              "endCaptures": {
                "1": {
                  "name": "punctuation.character.set.end.regexp constant.other.set.regexp"
                },
                "2": {
                  "name": "invalid.illegal.newline.python"
                }
              },
              "name": "meta.character.set.regexp",
              "patterns": [
                {
                  "include": "#regexp-charecter-set-escapes"
                },
                {
                  "match": "\\N",
                  "name": "constant.character.set.regexp"
                }
              ]
            }
          ]
        },
        "single-three-regexp-comments": {
          "begin": "\\(\\?#",
          "beginCaptures": {
            "0": {
              "name": "punctuation.comment.begin.regexp"
            }
          },
          "end": "(\\)|(?='''))",
          "endCaptures": {
            "1": {
              "name": "punctuation.comment.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "comment.regexp",
          "patterns": [
            {
              "include": "#codetags"
            }
          ]
        },
        "single-three-regexp-conditional": {
          "begin": "(\\()\\?\\((\\w+(?:\\s+\\p{alnum}+)?|\\d+)\\)",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.conditional.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.conditional.begin.regexp"
            }
          },
          "end": "(\\)|(?='''))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.conditional.negative.regexp punctuation.parenthesis.conditional.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#single-three-regexp-expression"
            },
            {
              "include": "#comments-string-single-three"
            }
          ]
        },
        "single-three-regexp-expression": {
          "patterns": [
            {
              "include": "#regexp-base-expression"
            },
            {
              "include": "#single-three-regexp-character-set"
            },
            {
              "include": "#single-three-regexp-comments"
            },
            {
              "include": "#regexp-flags"
            },
            {
              "include": "#single-three-regexp-named-group"
            },
            {
              "include": "#regexp-backreference"
            },
            {
              "include": "#single-three-regexp-lookahead"
            },
            {
              "include": "#single-three-regexp-lookahead-negative"
            },
            {
              "include": "#single-three-regexp-lookbehind"
            },
            {
              "include": "#single-three-regexp-lookbehind-negative"
            },
            {
              "include": "#single-three-regexp-conditional"
            },
            {
              "include": "#single-three-regexp-parentheses-non-capturing"
            },
            {
              "include": "#single-three-regexp-parentheses"
            },
            {
              "include": "#comments-string-single-three"
            }
          ]
        },
        "single-three-regexp-lookahead": {
          "begin": "(\\()\\?=",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookahead.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookahead.begin.regexp"
            }
          },
          "end": "(\\)|(?='''))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookahead.regexp punctuation.parenthesis.lookahead.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#single-three-regexp-expression"
            },
            {
              "include": "#comments-string-single-three"
            }
          ]
        },
        "single-three-regexp-lookahead-negative": {
          "begin": "(\\()\\?!",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookahead.negative.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookahead.begin.regexp"
            }
          },
          "end": "(\\)|(?='''))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookahead.negative.regexp punctuation.parenthesis.lookahead.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#single-three-regexp-expression"
            },
            {
              "include": "#comments-string-single-three"
            }
          ]
        },
        "single-three-regexp-lookbehind": {
          "begin": "(\\()\\?<=",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookbehind.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookbehind.begin.regexp"
            }
          },
          "end": "(\\)|(?='''))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookbehind.regexp punctuation.parenthesis.lookbehind.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#single-three-regexp-expression"
            },
            {
              "include": "#comments-string-single-three"
            }
          ]
        },
        "single-three-regexp-lookbehind-negative": {
          "begin": "(\\()\\?<!",
          "beginCaptures": {
            "0": {
              "name": "keyword.operator.lookbehind.negative.regexp"
            },
            "1": {
              "name": "punctuation.parenthesis.lookbehind.begin.regexp"
            }
          },
          "end": "(\\)|(?='''))",
          "endCaptures": {
            "1": {
              "name": "keyword.operator.lookbehind.negative.regexp punctuation.parenthesis.lookbehind.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#single-three-regexp-expression"
            },
            {
              "include": "#comments-string-single-three"
            }
          ]
        },
        "single-three-regexp-named-group": {
          "begin": "(\\()(\\?P<\\w+(?:\\s+\\p{alnum}+)?>)",
          "beginCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.named.begin.regexp"
            },
            "2": {
              "name": "entity.name.tag.named.group.regexp"
            }
          },
          "end": "(\\)|(?='''))",
          "endCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.named.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "meta.named.regexp",
          "patterns": [
            {
              "include": "#single-three-regexp-expression"
            },
            {
              "include": "#comments-string-single-three"
            }
          ]
        },
        "single-three-regexp-parentheses": {
          "begin": "\\(",
          "beginCaptures": {
            "0": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.begin.regexp"
            }
          },
          "end": "(\\)|(?='''))",
          "endCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#single-three-regexp-expression"
            },
            {
              "include": "#comments-string-single-three"
            }
          ]
        },
        "single-three-regexp-parentheses-non-capturing": {
          "begin": "\\(\\?:",
          "beginCaptures": {
            "0": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.non-capturing.begin.regexp"
            }
          },
          "end": "(\\)|(?='''))",
          "endCaptures": {
            "1": {
              "name": "support.other.parenthesis.regexp punctuation.parenthesis.non-capturing.end.regexp"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "patterns": [
            {
              "include": "#single-three-regexp-expression"
            },
            {
              "include": "#comments-string-single-three"
            }
          ]
        },
        "special-names": {
          "match": "\\b(_*\\p{upper}[_\\d]*\\p{upper})[[:upper:]\\d]*(_\\w*)?\\b",
          "name": "constant.other.caps.python"
        },
        "special-variables": {
          "captures": {
            "1": {
              "name": "variable.language.special.self.python"
            },
            "2": {
              "name": "variable.language.special.cls.python"
            }
          },
          "match": "\\b(?<!\\.)(?:(self)|(cls))\\b"
        },
        "statement": {
          "patterns": [
            {
              "include": "#import"
            },
            {
              "include": "#class-declaration"
            },
            {
              "include": "#function-declaration"
            },
            {
              "include": "#generator"
            },
            {
              "include": "#statement-keyword"
            },
            {
              "include": "#assignment-operator"
            },
            {
              "include": "#decorator"
            },
            {
              "include": "#docstring-statement"
            },
            {
              "include": "#semicolon"
            }
          ]
        },
        "statement-keyword": {
          "patterns": [
            {
              "match": "\\b((async\\s+)?\\s*def)\\b",
              "name": "storage.type.function.python"
            },
            {
              "match": "\\b(?<!\\.)as\\b(?=.*[:\\\\])",
              "name": "keyword.control.flow.python"
            },
            {
              "match": "\\b(?<!\\.)as\\b",
              "name": "keyword.control.import.python"
            },
            {
              "match": "\\b(?<!\\.)(async|continue|del|assert|break|finally|for|from|elif|else|if|except|pass|raise|return|try|while|with)\\b",
              "name": "keyword.control.flow.python"
            },
            {
              "match": "\\b(?<!\\.)(global|nonlocal)\\b",
              "name": "storage.modifier.declaration.python"
            },
            {
              "match": "\\b(?<!\\.)(class)\\b",
              "name": "storage.type.class.python"
            },
            {
              "captures": {
                "1": {
                  "name": "keyword.control.flow.python"
                }
              },
              "match": "^\\s*(case|match)(?=\\s*([-\"#'(+:\\[{\\w\\d]|$))\\b"
            }
          ]
        },
        "string": {
          "patterns": [
            {
              "include": "#string-quoted-multi-line"
            },
            {
              "include": "#string-quoted-single-line"
            },
            {
              "include": "#string-bin-quoted-multi-line"
            },
            {
              "include": "#string-bin-quoted-single-line"
            },
            {
              "include": "#string-raw-quoted-multi-line"
            },
            {
              "include": "#string-raw-quoted-single-line"
            },
            {
              "include": "#string-raw-bin-quoted-multi-line"
            },
            {
              "include": "#string-raw-bin-quoted-single-line"
            },
            {
              "include": "#fstring-fnorm-quoted-multi-line"
            },
            {
              "include": "#fstring-fnorm-quoted-single-line"
            },
            {
              "include": "#fstring-normf-quoted-multi-line"
            },
            {
              "include": "#fstring-normf-quoted-single-line"
            },
            {
              "include": "#fstring-raw-quoted-multi-line"
            },
            {
              "include": "#fstring-raw-quoted-single-line"
            }
          ]
        },
        "string-bin-quoted-multi-line": {
          "begin": "\\b([Bb])('''|\"\"\")",
          "beginCaptures": {
            "1": {
              "name": "storage.type.string.python"
            },
            "2": {
              "name": "punctuation.definition.string.begin.python"
            }
          },
          "end": "(\\2)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "string.quoted.binary.multi.python",
          "patterns": [
            {
              "include": "#string-entity"
            }
          ]
        },
        "string-bin-quoted-single-line": {
          "begin": "\\b([Bb])(([\"']))",
          "beginCaptures": {
            "1": {
              "name": "storage.type.string.python"
            },
            "2": {
              "name": "punctuation.definition.string.begin.python"
            }
          },
          "end": "(\\2)|((?<!\\\\)\\n)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "string.quoted.binary.single.python",
          "patterns": [
            {
              "include": "#string-entity"
            }
          ]
        },
        "string-brace-formatting": {
          "patterns": [
            {
              "captures": {
                "1": {
                  "name": "constant.character.format.placeholder.other.python"
                },
                "3": {
                  "name": "storage.type.format.python"
                },
                "4": {
                  "name": "storage.type.format.python"
                }
              },
              "match": "(\\{\\{|}}|\\{\\w*(\\.[_[:alpha:]]\\w*|\\[[^]\"']+])*(![ars])?(:\\w?[<=>^]?[- +]?#?\\d*,?(\\.\\d+)?[%EFGXb-gnosx]?)?})",
              "name": "meta.format.brace.python"
            },
            {
              "captures": {
                "1": {
                  "name": "constant.character.format.placeholder.other.python"
                },
                "3": {
                  "name": "storage.type.format.python"
                },
                "4": {
                  "name": "storage.type.format.python"
                }
              },
              "match": "(\\{\\w*(\\.[_[:alpha:]]\\w*|\\[[^]\"']+])*(![ars])?(:)[^\\n\"'{}]*(?:\\{[^\\n\"'}]*?}[^\\n\"'{}]*)*})",
              "name": "meta.format.brace.python"
            }
          ]
        },
        "string-consume-escape": {
          "match": "\\\\[\\n\"'\\\\]"
        },
        "string-entity": {
          "patterns": [
            {
              "include": "#escape-sequence"
            },
            {
              "include": "#string-line-continuation"
            },
            {
              "include": "#string-formatting"
            }
          ]
        },
        "string-formatting": {
          "captures": {
            "1": {
              "name": "constant.character.format.placeholder.other.python"
            }
          },
          "match": "(%(\\([\\w\\s]*\\))?[- #+0]*(\\d+|\\*)?(\\.(\\d+|\\*))?([Lhl])?[%EFGXa-giorsux])",
          "name": "meta.format.percent.python"
        },
        "string-line-continuation": {
          "match": "\\\\$",
          "name": "constant.language.python"
        },
        "string-multi-bad-brace1-formatting-raw": {
          "begin": "(?=\\{%(.*?(?!'''|\"\"\"))%})",
          "end": "(?='''|\"\"\")",
          "patterns": [
            {
              "include": "#string-consume-escape"
            }
          ]
        },
        "string-multi-bad-brace1-formatting-unicode": {
          "begin": "(?=\\{%(.*?(?!'''|\"\"\"))%})",
          "end": "(?='''|\"\"\")",
          "patterns": [
            {
              "include": "#escape-sequence-unicode"
            },
            {
              "include": "#escape-sequence"
            },
            {
              "include": "#string-line-continuation"
            }
          ]
        },
        "string-multi-bad-brace2-formatting-raw": {
          "begin": "(?!\\{\\{)(?=\\{(\\w*?(?!'''|\"\"\")[^!.:\\[}\\w]).*?(?!'''|\"\"\")})",
          "end": "(?='''|\"\"\")",
          "patterns": [
            {
              "include": "#string-consume-escape"
            },
            {
              "include": "#string-formatting"
            }
          ]
        },
        "string-multi-bad-brace2-formatting-unicode": {
          "begin": "(?!\\{\\{)(?=\\{(\\w*?(?!'''|\"\"\")[^!.:\\[}\\w]).*?(?!'''|\"\"\")})",
          "end": "(?='''|\"\"\")",
          "patterns": [
            {
              "include": "#escape-sequence-unicode"
            },
            {
              "include": "#string-entity"
            }
          ]
        },
        "string-quoted-multi-line": {
          "begin": "(?:\\b([Rr])(?=[Uu]))?([Uu])?('''|\"\"\")",
          "beginCaptures": {
            "1": {
              "name": "invalid.illegal.prefix.python"
            },
            "2": {
              "name": "storage.type.string.python"
            },
            "3": {
              "name": "punctuation.definition.string.begin.python"
            }
          },
          "end": "(\\3)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "string.quoted.multi.python",
          "patterns": [
            {
              "include": "#string-multi-bad-brace1-formatting-unicode"
            },
            {
              "include": "#string-multi-bad-brace2-formatting-unicode"
            },
            {
              "include": "#string-unicode-guts"
            }
          ]
        },
        "string-quoted-single-line": {
          "begin": "(?:\\b([Rr])(?=[Uu]))?([Uu])?(([\"']))",
          "beginCaptures": {
            "1": {
              "name": "invalid.illegal.prefix.python"
            },
            "2": {
              "name": "storage.type.string.python"
            },
            "3": {
              "name": "punctuation.definition.string.begin.python"
            }
          },
          "end": "(\\3)|((?<!\\\\)\\n)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "string.quoted.single.python",
          "patterns": [
            {
              "include": "#string-single-bad-brace1-formatting-unicode"
            },
            {
              "include": "#string-single-bad-brace2-formatting-unicode"
            },
            {
              "include": "#string-unicode-guts"
            }
          ]
        },
        "string-raw-bin-guts": {
          "patterns": [
            {
              "include": "#string-consume-escape"
            },
            {
              "include": "#string-formatting"
            }
          ]
        },
        "string-raw-bin-quoted-multi-line": {
          "begin": "\\b(R[Bb]|[Bb]R)('''|\"\"\")",
          "beginCaptures": {
            "1": {
              "name": "storage.type.string.python"
            },
            "2": {
              "name": "punctuation.definition.string.begin.python"
            }
          },
          "end": "(\\2)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "string.quoted.raw.binary.multi.python",
          "patterns": [
            {
              "include": "#string-raw-bin-guts"
            }
          ]
        },
        "string-raw-bin-quoted-single-line": {
          "begin": "\\b(R[Bb]|[Bb]R)(([\"']))",
          "beginCaptures": {
            "1": {
              "name": "storage.type.string.python"
            },
            "2": {
              "name": "punctuation.definition.string.begin.python"
            }
          },
          "end": "(\\2)|((?<!\\\\)\\n)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "string.quoted.raw.binary.single.python",
          "patterns": [
            {
              "include": "#string-raw-bin-guts"
            }
          ]
        },
        "string-raw-guts": {
          "patterns": [
            {
              "include": "#string-consume-escape"
            },
            {
              "include": "#string-formatting"
            },
            {
              "include": "#string-brace-formatting"
            }
          ]
        },
        "string-raw-quoted-multi-line": {
          "begin": "\\b(([Uu]R)|(R))('''|\"\"\")",
          "beginCaptures": {
            "2": {
              "name": "invalid.deprecated.prefix.python"
            },
            "3": {
              "name": "storage.type.string.python"
            },
            "4": {
              "name": "punctuation.definition.string.begin.python"
            }
          },
          "end": "(\\4)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "string.quoted.raw.multi.python",
          "patterns": [
            {
              "include": "#string-multi-bad-brace1-formatting-raw"
            },
            {
              "include": "#string-multi-bad-brace2-formatting-raw"
            },
            {
              "include": "#string-raw-guts"
            }
          ]
        },
        "string-raw-quoted-single-line": {
          "begin": "\\b(([Uu]R)|(R))(([\"']))",
          "beginCaptures": {
            "2": {
              "name": "invalid.deprecated.prefix.python"
            },
            "3": {
              "name": "storage.type.string.python"
            },
            "4": {
              "name": "punctuation.definition.string.begin.python"
            }
          },
          "end": "(\\4)|((?<!\\\\)\\n)",
          "endCaptures": {
            "1": {
              "name": "punctuation.definition.string.end.python"
            },
            "2": {
              "name": "invalid.illegal.newline.python"
            }
          },
          "name": "string.quoted.raw.single.python",
          "patterns": [
            {
              "include": "#string-single-bad-brace1-formatting-raw"
            },
            {
              "include": "#string-single-bad-brace2-formatting-raw"
            },
            {
              "include": "#string-raw-guts"
            }
          ]
        },
        "string-single-bad-brace1-formatting-raw": {
          "begin": "(?=\\{%(.*?(?!([\"'])|((?<!\\\\)\\n)))%})",
          "end": "(?=([\"'])|((?<!\\\\)\\n))",
          "patterns": [
            {
              "include": "#string-consume-escape"
            }
          ]
        },
        "string-single-bad-brace1-formatting-unicode": {
          "begin": "(?=\\{%(.*?(?!([\"'])|((?<!\\\\)\\n)))%})",
          "end": "(?=([\"'])|((?<!\\\\)\\n))",
          "patterns": [
            {
              "include": "#escape-sequence-unicode"
            },
            {
              "include": "#escape-sequence"
            },
            {
              "include": "#string-line-continuation"
            }
          ]
        },
        "string-single-bad-brace2-formatting-raw": {
          "begin": "(?!\\{\\{)(?=\\{(\\w*?(?!([\"'])|((?<!\\\\)\\n))[^!.:\\[}\\w]).*?(?!([\"'])|((?<!\\\\)\\n))})",
          "end": "(?=([\"'])|((?<!\\\\)\\n))",
          "patterns": [
            {
              "include": "#string-consume-escape"
            },
            {
              "include": "#string-formatting"
            }
          ]
        },
        "string-single-bad-brace2-formatting-unicode": {
          "begin": "(?!\\{\\{)(?=\\{(\\w*?(?!([\"'])|((?<!\\\\)\\n))[^!.:\\[}\\w]).*?(?!([\"'])|((?<!\\\\)\\n))})",
          "end": "(?=([\"'])|((?<!\\\\)\\n))",
          "patterns": [
            {
              "include": "#escape-sequence-unicode"
            },
            {
              "include": "#string-entity"
            }
          ]
        },
        "string-unicode-guts": {
          "patterns": [
            {
              "include": "#escape-sequence-unicode"
            },
            {
              "include": "#string-entity"
            },
            {
              "include": "#string-brace-formatting"
            }
          ]
        }
      },
      "scopeName": "source.python"
    }
  },
  "theme": {
    "light": {
      "colors": {
        "activityBar.activeBackground": "#00000000",
        "activityBar.activeBorder": "#00000000",
        "activityBar.activeFocusBorder": "#00000000",
        "activityBar.background": "#dce0e8",
        "activityBar.border": "#00000000",
        "activityBar.dropBorder": "#8839ef33",
        "activityBar.foreground": "#8839ef",
        "activityBar.inactiveForeground": "#9ca0b0",
        "activityBarBadge.background": "#8839ef",
        "activityBarBadge.foreground": "#dce0e8",
        "activityBarTop.activeBorder": "#00000000",
        "activityBarTop.dropBorder": "#8839ef33",
        "activityBarTop.foreground": "#8839ef",
        "activityBarTop.inactiveForeground": "#9ca0b0",
        "badge.background": "#bcc0cc",
        "badge.foreground": "#4c4f69",
        "banner.background": "#bcc0cc",
        "banner.foreground": "#4c4f69",
        "banner.iconForeground": "#4c4f69",
        "breadcrumb.activeSelectionForeground": "#8839ef",
        "breadcrumb.background": "#eff1f5",
        "breadcrumb.focusForeground": "#8839ef",
        "breadcrumb.foreground": "#4c4f69cc",
        "breadcrumbPicker.background": "#e6e9ef",
        "button.background": "#8839ef",
        "button.border": "#00000000",
        "button.foreground": "#dce0e8",
        "button.hoverBackground": "#9c5af2",
        "button.secondaryBackground": "#acb0be",
        "button.secondaryBorder": "#8839ef",
        "button.secondaryForeground": "#4c4f69",
        "button.secondaryHoverBackground": "#c0c3ce",
        "button.separator": "#00000000",
        "charts.blue": "#1e66f5",
        "charts.foreground": "#4c4f69",
        "charts.green": "#40a02b",
        "charts.lines": "#5c5f77",
        "charts.orange": "#fe640b",
        "charts.purple": "#8839ef",
        "charts.red": "#d20f39",
        "charts.yellow": "#df8e1d",
        "checkbox.background": "#bcc0cc",
        "checkbox.border": "#00000000",
        "checkbox.foreground": "#8839ef",
        "commandCenter.activeBackground": "#acb0be33",
        "commandCenter.activeBorder": "#8839ef",
        "commandCenter.activeForeground": "#8839ef",
        "commandCenter.background": "#e6e9ef",
        "commandCenter.border": "#00000000",
        "commandCenter.foreground": "#5c5f77",
        "commandCenter.inactiveBorder": "#00000000",
        "commandCenter.inactiveForeground": "#5c5f77",
        "debugConsole.errorForeground": "#d20f39",
        "debugConsole.infoForeground": "#1e66f5",
        "debugConsole.sourceForeground": "#dc8a78",
        "debugConsole.warningForeground": "#fe640b",
        "debugConsoleInputIcon.foreground": "#4c4f69",
        "debugExceptionWidget.background": "#dce0e8",
        "debugExceptionWidget.border": "#8839ef",
        "debugIcon.breakpointCurrentStackframeForeground": "#acb0be",
        "debugIcon.breakpointDisabledForeground": "#d20f3999",
        "debugIcon.breakpointForeground": "#d20f39",
        "debugIcon.breakpointStackframeForeground": "#acb0be",
        "debugIcon.breakpointUnverifiedForeground": "#bf607c",
        "debugIcon.continueForeground": "#40a02b",
        "debugIcon.disconnectForeground": "#acb0be",
        "debugIcon.pauseForeground": "#1e66f5",
        "debugIcon.restartForeground": "#179299",
        "debugIcon.startForeground": "#40a02b",
        "debugIcon.stepBackForeground": "#acb0be",
        "debugIcon.stepIntoForeground": "#4c4f69",
        "debugIcon.stepOutForeground": "#4c4f69",
        "debugIcon.stepOverForeground": "#8839ef",
        "debugIcon.stopForeground": "#d20f39",
        "debugTokenExpression.boolean": "#8839ef",
        "debugTokenExpression.error": "#d20f39",
        "debugTokenExpression.number": "#fe640b",
        "debugTokenExpression.string": "#40a02b",
        "debugToolBar.background": "#dce0e8",
        "debugToolBar.border": "#00000000",
        "descriptionForeground": "#4c4f69",
        "diffEditor.border": "#acb0be",
        "diffEditor.diagonalFill": "#acb0be99",
        "diffEditor.insertedLineBackground": "#40a02b26",
        "diffEditor.insertedTextBackground": "#40a02b33",
        "diffEditor.removedLineBackground": "#d20f3926",
        "diffEditor.removedTextBackground": "#d20f3933",
        "diffEditorOverview.insertedForeground": "#40a02bcc",
        "diffEditorOverview.removedForeground": "#d20f39cc",
        "disabledForeground": "#6c6f85",
        "dropdown.background": "#e6e9ef",
        "dropdown.border": "#8839ef",
        "dropdown.foreground": "#4c4f69",
        "dropdown.listBackground": "#acb0be",
        "editor.background": "#eff1f5",
        "editor.findMatchBackground": "#e6adbd",
        "editor.findMatchBorder": "#d20f3933",
        "editor.findMatchHighlightBackground": "#a9daf0",
        "editor.findMatchHighlightBorder": "#04a5e533",
        "editor.findRangeHighlightBackground": "#a9daf0",
        "editor.findRangeHighlightBorder": "#04a5e533",
        "editor.focusedStackFrameHighlightBackground": "#40a02b26",
        "editor.foldBackground": "#04a5e540",
        "editor.foreground": "#4c4f69",
        "editor.hoverHighlightBackground": "#04a5e540",
        "editor.lineHighlightBackground": "#4c4f6912",
        "editor.lineHighlightBorder": "#00000000",
        "editor.rangeHighlightBackground": "#04a5e540",
        "editor.rangeHighlightBorder": "#00000000",
        "editor.selectionBackground": "#7c7f934d",
        "editor.selectionHighlightBackground": "#7c7f9333",
        "editor.selectionHighlightBorder": "#7c7f9333",
        "editor.stackFrameHighlightBackground": "#df8e1d26",
        "editor.wordHighlightBackground": "#7c7f9333",
        "editor.wordHighlightStrongBackground": "#1e66f526",
        "editorBracketHighlight.foreground1": "#d20f39",
        "editorBracketHighlight.foreground2": "#fe640b",
        "editorBracketHighlight.foreground3": "#df8e1d",
        "editorBracketHighlight.foreground4": "#40a02b",
        "editorBracketHighlight.foreground5": "#209fb5",
        "editorBracketHighlight.foreground6": "#8839ef",
        "editorBracketHighlight.unexpectedBracket.foreground": "#e64553",
        "editorBracketMatch.background": "#7c7f931a",
        "editorBracketMatch.border": "#7c7f93",
        "editorCodeLens.foreground": "#8c8fa1",
        "editorCursor.background": "#eff1f5",
        "editorCursor.foreground": "#dc8a78",
        "editorError.background": "#00000000",
        "editorError.border": "#00000000",
        "editorError.foreground": "#d20f39",
        "editorGroup.border": "#acb0be",
        "editorGroup.dropBackground": "#8839ef33",
        "editorGroup.emptyBackground": "#eff1f5",
        "editorGroupHeader.tabsBackground": "#dce0e8",
        "editorGutter.addedBackground": "#40a02b",
        "editorGutter.background": "#eff1f5",
        "editorGutter.commentGlyphForeground": "#8839ef",
        "editorGutter.commentRangeForeground": "#ccd0da",
        "editorGutter.deletedBackground": "#d20f39",
        "editorGutter.foldingControlForeground": "#7c7f93",
        "editorGutter.modifiedBackground": "#df8e1d",
        "editorHoverWidget.background": "#e6e9ef",
        "editorHoverWidget.border": "#acb0be",
        "editorHoverWidget.foreground": "#4c4f69",
        "editorIndentGuide.activeBackground": "#acb0be",
        "editorIndentGuide.background": "#bcc0cc",
        "editorInfo.background": "#00000000",
        "editorInfo.border": "#00000000",
        "editorInfo.foreground": "#1e66f5",
        "editorInlayHint.background": "#e6e9efbf",
        "editorInlayHint.foreground": "#acb0be",
        "editorInlayHint.parameterBackground": "#e6e9efbf",
        "editorInlayHint.parameterForeground": "#6c6f85",
        "editorInlayHint.typeBackground": "#e6e9efbf",
        "editorInlayHint.typeForeground": "#5c5f77",
        "editorLightBulb.foreground": "#df8e1d",
        "editorLineNumber.activeForeground": "#8839ef",
        "editorLineNumber.foreground": "#8c8fa1",
        "editorLink.activeForeground": "#8839ef",
        "editorMarkerNavigation.background": "#e6e9ef",
        "editorMarkerNavigationError.background": "#d20f39",
        "editorMarkerNavigationInfo.background": "#1e66f5",
        "editorMarkerNavigationWarning.background": "#fe640b",
        "editorOverviewRuler.background": "#e6e9ef",
        "editorOverviewRuler.border": "#4c4f6912",
        "editorOverviewRuler.modifiedForeground": "#df8e1d",
        "editorRuler.foreground": "#acb0be",
        "editorStickyScrollHover.background": "#ccd0da",
        "editorSuggestWidget.background": "#e6e9ef",
        "editorSuggestWidget.border": "#acb0be",
        "editorSuggestWidget.foreground": "#4c4f69",
        "editorSuggestWidget.highlightForeground": "#8839ef",
        "editorSuggestWidget.selectedBackground": "#ccd0da",
        "editorWarning.background": "#00000000",
        "editorWarning.border": "#00000000",
        "editorWarning.foreground": "#fe640b",
        "editorWhitespace.foreground": "#7c7f9366",
        "editorWidget.background": "#e6e9ef",
        "editorWidget.foreground": "#4c4f69",
        "editorWidget.resizeBorder": "#acb0be",
        "errorForeground": "#d20f39",
        "errorLens.errorBackground": "#d20f3926",
        "errorLens.errorBackgroundLight": "#d20f3926",
        "errorLens.errorForeground": "#d20f39",
        "errorLens.errorForegroundLight": "#d20f39",
        "errorLens.errorMessageBackground": "#d20f3926",
        "errorLens.hintBackground": "#40a02b26",
        "errorLens.hintBackgroundLight": "#40a02b26",
        "errorLens.hintForeground": "#40a02b",
        "errorLens.hintForegroundLight": "#40a02b",
        "errorLens.hintMessageBackground": "#40a02b26",
        "errorLens.infoBackground": "#1e66f526",
        "errorLens.infoBackgroundLight": "#1e66f526",
        "errorLens.infoForeground": "#1e66f5",
        "errorLens.infoForegroundLight": "#1e66f5",
        "errorLens.infoMessageBackground": "#1e66f526",
        "errorLens.statusBarErrorForeground": "#d20f39",
        "errorLens.statusBarHintForeground": "#40a02b",
        "errorLens.statusBarIconErrorForeground": "#d20f39",
        "errorLens.statusBarIconWarningForeground": "#fe640b",
        "errorLens.statusBarInfoForeground": "#1e66f5",
        "errorLens.statusBarWarningForeground": "#fe640b",
        "errorLens.warningBackground": "#fe640b26",
        "errorLens.warningBackgroundLight": "#fe640b26",
        "errorLens.warningForeground": "#fe640b",
        "errorLens.warningForegroundLight": "#fe640b",
        "errorLens.warningMessageBackground": "#fe640b26",
        "extensionBadge.remoteBackground": "#1e66f5",
        "extensionBadge.remoteForeground": "#dce0e8",
        "extensionButton.prominentBackground": "#8839ef",
        "extensionButton.prominentForeground": "#dce0e8",
        "extensionButton.prominentHoverBackground": "#9c5af2",
        "extensionButton.separator": "#eff1f5",
        "extensionIcon.preReleaseForeground": "#acb0be",
        "extensionIcon.sponsorForeground": "#ea76cb",
        "extensionIcon.starForeground": "#df8e1d",
        "extensionIcon.verifiedForeground": "#40a02b",
        "focusBorder": "#8839ef",
        "foreground": "#4c4f69",
        "gitDecoration.addedResourceForeground": "#40a02b",
        "gitDecoration.conflictingResourceForeground": "#8839ef",
        "gitDecoration.deletedResourceForeground": "#d20f39",
        "gitDecoration.ignoredResourceForeground": "#9ca0b0",
        "gitDecoration.modifiedResourceForeground": "#df8e1d",
        "gitDecoration.stageDeletedResourceForeground": "#d20f39",
        "gitDecoration.stageModifiedResourceForeground": "#df8e1d",
        "gitDecoration.submoduleResourceForeground": "#1e66f5",
        "gitDecoration.untrackedResourceForeground": "#40a02b",
        "gitlens.closedAutolinkedIssueIconColor": "#8839ef",
        "gitlens.closedPullRequestIconColor": "#d20f39",
        "gitlens.decorations.branchAheadForegroundColor": "#40a02b",
        "gitlens.decorations.branchBehindForegroundColor": "#fe640b",
        "gitlens.decorations.branchDivergedForegroundColor": "#df8e1d",
        "gitlens.decorations.branchMissingUpstreamForegroundColor": "#fe640b",
        "gitlens.decorations.branchUnpublishedForegroundColor": "#40a02b",
        "gitlens.decorations.statusMergingOrRebasingConflictForegroundColor": "#e64553",
        "gitlens.decorations.statusMergingOrRebasingForegroundColor": "#df8e1d",
        "gitlens.decorations.workspaceCurrentForegroundColor": "#8839ef",
        "gitlens.decorations.workspaceRepoMissingForegroundColor": "#6c6f85",
        "gitlens.decorations.workspaceRepoOpenForegroundColor": "#8839ef",
        "gitlens.decorations.worktreeHasUncommittedChangesForegroundColor": "#fe640b",
        "gitlens.decorations.worktreeMissingForegroundColor": "#e64553",
        "gitlens.graphChangesColumnAddedColor": "#40a02b",
        "gitlens.graphChangesColumnDeletedColor": "#d20f39",
        "gitlens.graphLane10Color": "#ea76cb",
        "gitlens.graphLane1Color": "#8839ef",
        "gitlens.graphLane2Color": "#df8e1d",
        "gitlens.graphLane3Color": "#1e66f5",
        "gitlens.graphLane4Color": "#dd7878",
        "gitlens.graphLane5Color": "#40a02b",
        "gitlens.graphLane6Color": "#7287fd",
        "gitlens.graphLane7Color": "#dc8a78",
        "gitlens.graphLane8Color": "#d20f39",
        "gitlens.graphLane9Color": "#179299",
        "gitlens.graphMinimapMarkerHeadColor": "#40a02b",
        "gitlens.graphMinimapMarkerHighlightsColor": "#df8e1d",
        "gitlens.graphMinimapMarkerLocalBranchesColor": "#1e66f5",
        "gitlens.graphMinimapMarkerRemoteBranchesColor": "#0b57ef",
        "gitlens.graphMinimapMarkerStashesColor": "#8839ef",
        "gitlens.graphMinimapMarkerTagsColor": "#dd7878",
        "gitlens.graphMinimapMarkerUpstreamColor": "#388c26",
        "gitlens.graphScrollMarkerHeadColor": "#40a02b",
        "gitlens.graphScrollMarkerHighlightsColor": "#df8e1d",
        "gitlens.graphScrollMarkerLocalBranchesColor": "#1e66f5",
        "gitlens.graphScrollMarkerRemoteBranchesColor": "#0b57ef",
        "gitlens.graphScrollMarkerStashesColor": "#8839ef",
        "gitlens.graphScrollMarkerTagsColor": "#dd7878",
        "gitlens.graphScrollMarkerUpstreamColor": "#388c26",
        "gitlens.gutterBackgroundColor": "#ccd0da4d",
        "gitlens.gutterForegroundColor": "#4c4f69",
        "gitlens.gutterUncommittedForegroundColor": "#8839ef",
        "gitlens.lineHighlightBackgroundColor": "#8839ef26",
        "gitlens.lineHighlightOverviewRulerColor": "#8839efcc",
        "gitlens.mergedPullRequestIconColor": "#8839ef",
        "gitlens.openAutolinkedIssueIconColor": "#40a02b",
        "gitlens.openPullRequestIconColor": "#40a02b",
        "gitlens.trailingLineBackgroundColor": "#00000000",
        "gitlens.trailingLineForegroundColor": "#4c4f694d",
        "gitlens.unpublishedChangesIconColor": "#40a02b",
        "gitlens.unpublishedCommitIconColor": "#40a02b",
        "gitlens.unpulledChangesIconColor": "#fe640b",
        "icon.foreground": "#8839ef",
        "input.background": "#ccd0da",
        "input.border": "#00000000",
        "input.foreground": "#4c4f69",
        "input.placeholderForeground": "#4c4f6973",
        "inputOption.activeBackground": "#acb0be",
        "inputOption.activeBorder": "#8839ef",
        "inputOption.activeForeground": "#4c4f69",
        "inputValidation.errorBackground": "#d20f39",
        "inputValidation.errorBorder": "#dce0e833",
        "inputValidation.errorForeground": "#dce0e8",
        "inputValidation.infoBackground": "#1e66f5",
        "inputValidation.infoBorder": "#dce0e833",
        "inputValidation.infoForeground": "#dce0e8",
        "inputValidation.warningBackground": "#fe640b",
        "inputValidation.warningBorder": "#dce0e833",
        "inputValidation.warningForeground": "#dce0e8",
        "issues.closed": "#8839ef",
        "issues.newIssueDecoration": "#dc8a78",
        "issues.open": "#40a02b",
        "list.activeSelectionBackground": "#ccd0da",
        "list.activeSelectionForeground": "#4c4f69",
        "list.dropBackground": "#8839ef33",
        "list.focusAndSelectionBackground": "#bcc0cc",
        "list.focusBackground": "#ccd0da",
        "list.focusForeground": "#4c4f69",
        "list.focusOutline": "#00000000",
        "list.highlightForeground": "#8839ef",
        "list.hoverBackground": "#ccd0da80",
        "list.hoverForeground": "#4c4f69",
        "list.inactiveSelectionBackground": "#ccd0da",
        "list.inactiveSelectionForeground": "#4c4f69",
        "list.warningForeground": "#fe640b",
        "listFilterWidget.background": "#bcc0cc",
        "listFilterWidget.noMatchesOutline": "#d20f39",
        "listFilterWidget.outline": "#00000000",
        "menu.background": "#eff1f5",
        "menu.border": "#eff1f580",
        "menu.foreground": "#4c4f69",
        "menu.selectionBackground": "#acb0be",
        "menu.selectionBorder": "#00000000",
        "menu.selectionForeground": "#4c4f69",
        "menu.separatorBackground": "#acb0be",
        "menubar.selectionBackground": "#bcc0cc",
        "menubar.selectionForeground": "#4c4f69",
        "merge.commonContentBackground": "#bcc0cc",
        "merge.commonHeaderBackground": "#acb0be",
        "merge.currentContentBackground": "#40a02b33",
        "merge.currentHeaderBackground": "#40a02b66",
        "merge.incomingContentBackground": "#1e66f533",
        "merge.incomingHeaderBackground": "#1e66f566",
        "minimap.background": "#e6e9ef80",
        "minimap.errorHighlight": "#d20f39bf",
        "minimap.findMatchHighlight": "#04a5e54d",
        "minimap.selectionHighlight": "#acb0bebf",
        "minimap.selectionOccurrenceHighlight": "#acb0bebf",
        "minimap.warningHighlight": "#fe640bbf",
        "minimapGutter.addedBackground": "#40a02bbf",
        "minimapGutter.deletedBackground": "#d20f39bf",
        "minimapGutter.modifiedBackground": "#df8e1dbf",
        "minimapSlider.activeBackground": "#8839ef99",
        "minimapSlider.background": "#8839ef33",
        "minimapSlider.hoverBackground": "#8839ef66",
        "notificationCenter.border": "#8839ef",
        "notificationCenterHeader.background": "#e6e9ef",
        "notificationCenterHeader.foreground": "#4c4f69",
        "notificationLink.foreground": "#1e66f5",
        "notificationToast.border": "#8839ef",
        "notifications.background": "#e6e9ef",
        "notifications.border": "#8839ef",
        "notifications.foreground": "#4c4f69",
        "notificationsErrorIcon.foreground": "#d20f39",
        "notificationsInfoIcon.foreground": "#1e66f5",
        "notificationsWarningIcon.foreground": "#fe640b",
        "panel.background": "#eff1f5",
        "panel.border": "#acb0be",
        "panelSection.border": "#acb0be",
        "panelSection.dropBackground": "#8839ef33",
        "panelTitle.activeBorder": "#8839ef",
        "panelTitle.activeForeground": "#4c4f69",
        "panelTitle.inactiveForeground": "#6c6f85",
        "peekView.border": "#8839ef",
        "peekViewEditor.background": "#e6e9ef",
        "peekViewEditor.matchHighlightBackground": "#04a5e54d",
        "peekViewEditor.matchHighlightBorder": "#00000000",
        "peekViewEditorGutter.background": "#e6e9ef",
        "peekViewResult.background": "#e6e9ef",
        "peekViewResult.fileForeground": "#4c4f69",
        "peekViewResult.lineForeground": "#4c4f69",
        "peekViewResult.matchHighlightBackground": "#04a5e54d",
        "peekViewResult.selectionBackground": "#ccd0da",
        "peekViewResult.selectionForeground": "#4c4f69",
        "peekViewTitle.background": "#eff1f5",
        "peekViewTitleDescription.foreground": "#5c5f77b3",
        "peekViewTitleLabel.foreground": "#4c4f69",
        "pickerGroup.border": "#8839ef",
        "pickerGroup.foreground": "#8839ef",
        "problemsErrorIcon.foreground": "#d20f39",
        "problemsInfoIcon.foreground": "#1e66f5",
        "problemsWarningIcon.foreground": "#fe640b",
        "progressBar.background": "#8839ef",
        "pullRequests.closed": "#d20f39",
        "pullRequests.draft": "#7c7f93",
        "pullRequests.merged": "#8839ef",
        "pullRequests.notification": "#4c4f69",
        "pullRequests.open": "#40a02b",
        "sash.hoverBorder": "#8839ef",
        "scmGraph.foreground1": "#df8e1d",
        "scmGraph.foreground2": "#d20f39",
        "scmGraph.foreground3": "#40a02b",
        "scmGraph.foreground4": "#8839ef",
        "scmGraph.foreground5": "#179299",
        "scmGraph.historyItemBaseRefColor": "#fe640b",
        "scmGraph.historyItemRefColor": "#1e66f5",
        "scmGraph.historyItemRemoteRefColor": "#8839ef",
        "scrollbar.shadow": "#dce0e8",
        "scrollbarSlider.activeBackground": "#ccd0da66",
        "scrollbarSlider.background": "#acb0be80",
        "scrollbarSlider.hoverBackground": "#9ca0b0",
        "selection.background": "#8839ef66",
        "settings.dropdownBackground": "#bcc0cc",
        "settings.dropdownListBorder": "#00000000",
        "settings.focusedRowBackground": "#acb0be33",
        "settings.headerForeground": "#4c4f69",
        "settings.modifiedItemIndicator": "#8839ef",
        "settings.numberInputBackground": "#bcc0cc",
        "settings.numberInputBorder": "#00000000",
        "settings.textInputBackground": "#bcc0cc",
        "settings.textInputBorder": "#00000000",
        "sideBar.background": "#e6e9ef",
        "sideBar.border": "#00000000",
        "sideBar.dropBackground": "#8839ef33",
        "sideBar.foreground": "#4c4f69",
        "sideBarSectionHeader.background": "#e6e9ef",
        "sideBarSectionHeader.foreground": "#4c4f69",
        "sideBarTitle.foreground": "#8839ef",
        "statusBar.background": "#dce0e8",
        "statusBar.border": "#00000000",
        "statusBar.debuggingBackground": "#fe640b",
        "statusBar.debuggingBorder": "#00000000",
        "statusBar.debuggingForeground": "#dce0e8",
        "statusBar.foreground": "#4c4f69",
        "statusBar.noFolderBackground": "#dce0e8",
        "statusBar.noFolderBorder": "#00000000",
        "statusBar.noFolderForeground": "#4c4f69",
        "statusBarItem.activeBackground": "#acb0be66",
        "statusBarItem.errorBackground": "#00000000",
        "statusBarItem.errorForeground": "#d20f39",
        "statusBarItem.hoverBackground": "#acb0be33",
        "statusBarItem.prominentBackground": "#00000000",
        "statusBarItem.prominentForeground": "#8839ef",
        "statusBarItem.prominentHoverBackground": "#acb0be33",
        "statusBarItem.remoteBackground": "#1e66f5",
        "statusBarItem.remoteForeground": "#dce0e8",
        "statusBarItem.warningBackground": "#00000000",
        "statusBarItem.warningForeground": "#fe640b",
        "symbolIcon.arrayForeground": "#fe640b",
        "symbolIcon.booleanForeground": "#8839ef",
        "symbolIcon.classForeground": "#df8e1d",
        "symbolIcon.colorForeground": "#ea76cb",
        "symbolIcon.constantForeground": "#fe640b",
        "symbolIcon.constructorForeground": "#7287fd",
        "symbolIcon.enumeratorForeground": "#df8e1d",
        "symbolIcon.enumeratorMemberForeground": "#df8e1d",
        "symbolIcon.eventForeground": "#ea76cb",
        "symbolIcon.fieldForeground": "#4c4f69",
        "symbolIcon.fileForeground": "#8839ef",
        "symbolIcon.folderForeground": "#8839ef",
        "symbolIcon.functionForeground": "#1e66f5",
        "symbolIcon.interfaceForeground": "#df8e1d",
        "symbolIcon.keyForeground": "#179299",
        "symbolIcon.keywordForeground": "#8839ef",
        "symbolIcon.methodForeground": "#1e66f5",
        "symbolIcon.moduleForeground": "#4c4f69",
        "symbolIcon.namespaceForeground": "#df8e1d",
        "symbolIcon.nullForeground": "#e64553",
        "symbolIcon.numberForeground": "#fe640b",
        "symbolIcon.objectForeground": "#df8e1d",
        "symbolIcon.operatorForeground": "#179299",
        "symbolIcon.packageForeground": "#dd7878",
        "symbolIcon.propertyForeground": "#e64553",
        "symbolIcon.referenceForeground": "#df8e1d",
        "symbolIcon.snippetForeground": "#dd7878",
        "symbolIcon.stringForeground": "#40a02b",
        "symbolIcon.structForeground": "#179299",
        "symbolIcon.textForeground": "#4c4f69",
        "symbolIcon.typeParameterForeground": "#e64553",
        "symbolIcon.unitForeground": "#4c4f69",
        "symbolIcon.variableForeground": "#4c4f69",
        "tab.activeBackground": "#eff1f5",
        "tab.activeBorder": "#00000000",
        "tab.activeBorderTop": "#8839ef",
        "tab.activeForeground": "#8839ef",
        "tab.activeModifiedBorder": "#df8e1d",
        "tab.border": "#e6e9ef",
        "tab.hoverBackground": "#ffffff",
        "tab.hoverBorder": "#00000000",
        "tab.hoverForeground": "#8839ef",
        "tab.inactiveBackground": "#e6e9ef",
        "tab.inactiveForeground": "#9ca0b0",
        "tab.inactiveModifiedBorder": "#df8e1d4d",
        "tab.lastPinnedBorder": "#8839ef",
        "tab.unfocusedActiveBackground": "#e6e9ef",
        "tab.unfocusedActiveBorder": "#00000000",
        "tab.unfocusedActiveBorderTop": "#8839ef4d",
        "tab.unfocusedInactiveBackground": "#d6dbe5",
        "table.headerBackground": "#ccd0da",
        "table.headerForeground": "#4c4f69",
        "terminal.ansiBlack": "#5c5f77",
        "terminal.ansiBlue": "#1e66f5",
        "terminal.ansiBrightBlack": "#6c6f85",
        "terminal.ansiBrightBlue": "#456eff",
        "terminal.ansiBrightCyan": "#2d9fa8",
        "terminal.ansiBrightGreen": "#49af3d",
        "terminal.ansiBrightMagenta": "#fe85d8",
        "terminal.ansiBrightRed": "#de293e",
        "terminal.ansiBrightWhite": "#bcc0cc",
        "terminal.ansiBrightYellow": "#eea02d",
        "terminal.ansiCyan": "#179299",
        "terminal.ansiGreen": "#40a02b",
        "terminal.ansiMagenta": "#ea76cb",
        "terminal.ansiRed": "#d20f39",
        "terminal.ansiWhite": "#acb0be",
        "terminal.ansiYellow": "#df8e1d",
        "terminal.border": "#acb0be",
        "terminal.dropBackground": "#8839ef33",
        "terminal.foreground": "#4c4f69",
        "terminal.inactiveSelectionBackground": "#acb0be80",
        "terminal.selectionBackground": "#acb0be",
        "terminal.tab.activeBorder": "#8839ef",
        "terminalCommandDecoration.defaultBackground": "#acb0be",
        "terminalCommandDecoration.errorBackground": "#d20f39",
        "terminalCommandDecoration.successBackground": "#40a02b",
        "terminalCursor.background": "#eff1f5",
        "terminalCursor.foreground": "#dc8a78",
        "testing.coverCountBadgeBackground": "#00000000",
        "testing.coverCountBadgeForeground": "#8839ef",
        "testing.coveredBackground": "#40a02b4d",
        "testing.coveredBorder": "#00000000",
        "testing.coveredGutterBackground": "#40a02b4d",
        "testing.iconErrored": "#d20f39",
        "testing.iconErrored.retired": "#d20f39",
        "testing.iconFailed": "#d20f39",
        "testing.iconFailed.retired": "#d20f39",
        "testing.iconPassed": "#40a02b",
        "testing.iconPassed.retired": "#40a02b",
        "testing.iconQueued": "#1e66f5",
        "testing.iconQueued.retired": "#1e66f5",
        "testing.iconSkipped": "#6c6f85",
        "testing.iconSkipped.retired": "#6c6f85",
        "testing.iconUnset": "#4c4f69",
        "testing.iconUnset.retired": "#4c4f69",
        "testing.message.error.lineBackground": "#d20f3926",
        "testing.message.info.decorationForeground": "#40a02bcc",
        "testing.message.info.lineBackground": "#40a02b26",
        "testing.messagePeekBorder": "#8839ef",
        "testing.messagePeekHeaderBackground": "#acb0be",
        "testing.peekBorder": "#8839ef",
        "testing.peekHeaderBackground": "#acb0be",
        "testing.runAction": "#8839ef",
        "testing.uncoveredBackground": "#d20f3933",
        "testing.uncoveredBorder": "#00000000",
        "testing.uncoveredBranchBackground": "#d20f3933",
        "testing.uncoveredGutterBackground": "#d20f3940",
        "textBlockQuote.background": "#e6e9ef",
        "textBlockQuote.border": "#dce0e8",
        "textCodeBlock.background": "#e6e9ef",
        "textLink.activeForeground": "#04a5e5",
        "textLink.foreground": "#1e66f5",
        "textPreformat.foreground": "#4c4f69",
        "textSeparator.foreground": "#8839ef",
        "titleBar.activeBackground": "#dce0e8",
        "titleBar.activeForeground": "#4c4f69",
        "titleBar.border": "#00000000",
        "titleBar.inactiveBackground": "#dce0e8",
        "titleBar.inactiveForeground": "#4c4f6980",
        "tree.inactiveIndentGuidesStroke": "#bcc0cc",
        "tree.indentGuidesStroke": "#7c7f93",
        "walkThrough.embeddedEditorBackground": "#eff1f54d",
        "welcomePage.progress.background": "#dce0e8",
        "welcomePage.progress.foreground": "#8839ef",
        "welcomePage.tileBackground": "#e6e9ef",
        "widget.shadow": "#e6e9ef80",
        "window.activeBorder": "#00000000",
        "window.inactiveBorder": "#00000000"
      },
      "displayName": "Catppuccin Latte",
      "name": "catppuccin-latte",
      "semanticHighlighting": true,
      "semanticTokenColors": {
        "boolean": {
          "foreground": "#fe640b"
        },
        "builtinAttribute.attribute.library:rust": {
          "foreground": "#1e66f5"
        },
        "class.builtin:python": {
          "foreground": "#8839ef"
        },
        "class:python": {
          "foreground": "#df8e1d"
        },
        "constant.builtin.readonly:nix": {
          "foreground": "#8839ef"
        },
        "enumMember": {
          "foreground": "#179299"
        },
        "function.decorator:python": {
          "foreground": "#fe640b"
        },
        "generic.attribute:rust": {
          "foreground": "#4c4f69"
        },
        "heading": {
          "foreground": "#d20f39"
        },
        "number": {
          "foreground": "#fe640b"
        },
        "pol": {
          "foreground": "#dd7878"
        },
        "property.readonly:javascript": {
          "foreground": "#4c4f69"
        },
        "property.readonly:javascriptreact": {
          "foreground": "#4c4f69"
        },
        "property.readonly:typescript": {
          "foreground": "#4c4f69"
        },
        "property.readonly:typescriptreact": {
          "foreground": "#4c4f69"
        },
        "selfKeyword": {
          "foreground": "#d20f39"
        },
        "text.emph": {
          "fontStyle": "italic",
          "foreground": "#d20f39"
        },
        "text.math": {
          "foreground": "#dd7878"
        },
        "text.strong": {
          "fontStyle": "bold",
          "foreground": "#d20f39"
        },
        "tomlArrayKey": {
          "fontStyle": "",
          "foreground": "#1e66f5"
        },
        "tomlTableKey": {
          "fontStyle": "",
          "foreground": "#1e66f5"
        },
        "type.defaultLibrary:go": {
          "foreground": "#8839ef"
        },
        "variable.defaultLibrary": {
          "foreground": "#e64553"
        },
        "variable.readonly.defaultLibrary:go": {
          "foreground": "#8839ef"
        },
        "variable.readonly:javascript": {
          "foreground": "#4c4f69"
        },
        "variable.readonly:javascriptreact": {
          "foreground": "#4c4f69"
        },
        "variable.readonly:scala": {
          "foreground": "#4c4f69"
        },
        "variable.readonly:typescript": {
          "foreground": "#4c4f69"
        },
        "variable.readonly:typescriptreact": {
          "foreground": "#4c4f69"
        },
        "variable.typeHint:python": {
          "foreground": "#df8e1d"
        }
      },
      "tokenColors": [
        {
          "scope": [
            "text",
            "source",
            "variable.other.readwrite",
            "punctuation.definition.variable"
          ],
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": "punctuation",
          "settings": {
            "fontStyle": "",
            "foreground": "#7c7f93"
          }
        },
        {
          "scope": [
            "comment",
            "punctuation.definition.comment"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#7c7f93"
          }
        },
        {
          "scope": [
            "string",
            "punctuation.definition.string"
          ],
          "settings": {
            "foreground": "#40a02b"
          }
        },
        {
          "scope": "constant.character.escape",
          "settings": {
            "foreground": "#ea76cb"
          }
        },
        {
          "scope": [
            "constant.numeric",
            "variable.other.constant",
            "entity.name.constant",
            "constant.language.boolean",
            "constant.language.false",
            "constant.language.true",
            "keyword.other.unit.user-defined",
            "keyword.other.unit.suffix.floating-point"
          ],
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": [
            "keyword",
            "keyword.operator.word",
            "keyword.operator.new",
            "variable.language.super",
            "support.type.primitive",
            "storage.type",
            "storage.modifier",
            "punctuation.definition.keyword"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#8839ef"
          }
        },
        {
          "scope": "entity.name.tag.documentation",
          "settings": {
            "foreground": "#8839ef"
          }
        },
        {
          "scope": [
            "keyword.operator",
            "punctuation.accessor",
            "punctuation.definition.generic",
            "meta.function.closure punctuation.section.parameters",
            "punctuation.definition.tag",
            "punctuation.separator.key-value"
          ],
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": [
            "entity.name.function",
            "meta.function-call.method",
            "support.function",
            "support.function.misc",
            "variable.function"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": [
            "entity.name.class",
            "entity.other.inherited-class",
            "support.class",
            "meta.function-call.constructor",
            "entity.name.struct"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": "entity.name.enum",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": [
            "meta.enum variable.other.readwrite",
            "variable.other.enummember"
          ],
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": "meta.property.object",
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": [
            "meta.type",
            "meta.type-alias",
            "support.type",
            "entity.name.type"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": [
            "meta.annotation variable.function",
            "meta.annotation variable.annotation.function",
            "meta.annotation punctuation.definition.annotation",
            "meta.decorator",
            "punctuation.decorator"
          ],
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": [
            "variable.parameter",
            "meta.function.parameters"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#e64553"
          }
        },
        {
          "scope": [
            "constant.language",
            "support.function.builtin"
          ],
          "settings": {
            "foreground": "#d20f39"
          }
        },
        {
          "scope": "entity.other.attribute-name.documentation",
          "settings": {
            "foreground": "#d20f39"
          }
        },
        {
          "scope": [
            "keyword.control.directive",
            "punctuation.definition.directive"
          ],
          "settings": {
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": "punctuation.definition.typeparameters",
          "settings": {
            "foreground": "#04a5e5"
          }
        },
        {
          "scope": "entity.name.namespace",
          "settings": {
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": [
            "support.type.property-name.css",
            "support.type.property-name.less"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": [
            "variable.language.this",
            "variable.language.this punctuation.definition.variable"
          ],
          "settings": {
            "foreground": "#d20f39"
          }
        },
        {
          "scope": "variable.object.property",
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": [
            "string.template variable",
            "string variable"
          ],
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": "keyword.operator.new",
          "settings": {
            "fontStyle": "bold"
          }
        },
        {
          "scope": "storage.modifier.specifier.extern.cpp",
          "settings": {
            "foreground": "#8839ef"
          }
        },
        {
          "scope": [
            "entity.name.scope-resolution.template.call.cpp",
            "entity.name.scope-resolution.parameter.cpp",
            "entity.name.scope-resolution.cpp",
            "entity.name.scope-resolution.function.definition.cpp"
          ],
          "settings": {
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": "storage.type.class.doxygen",
          "settings": {
            "fontStyle": ""
          }
        },
        {
          "scope": [
            "storage.modifier.reference.cpp"
          ],
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": "meta.interpolation.cs",
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": "comment.block.documentation.cs",
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": [
            "source.css entity.other.attribute-name.class.css",
            "entity.other.attribute-name.parent-selector.css punctuation.definition.entity.css"
          ],
          "settings": {
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": "punctuation.separator.operator.css",
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": "source.css entity.other.attribute-name.pseudo-class",
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": "source.css constant.other.unicode-range",
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": "source.css variable.parameter.url",
          "settings": {
            "fontStyle": "",
            "foreground": "#40a02b"
          }
        },
        {
          "scope": [
            "support.type.vendored.property-name"
          ],
          "settings": {
            "foreground": "#04a5e5"
          }
        },
        {
          "scope": [
            "source.css meta.property-value variable",
            "source.css meta.property-value variable.other.less",
            "source.css meta.property-value variable.other.less punctuation.definition.variable.less",
            "meta.definition.variable.scss"
          ],
          "settings": {
            "foreground": "#e64553"
          }
        },
        {
          "scope": [
            "source.css meta.property-list variable",
            "meta.property-list variable.other.less",
            "meta.property-list variable.other.less punctuation.definition.variable.less"
          ],
          "settings": {
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": "keyword.other.unit.percentage.css",
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": "source.css meta.attribute-selector",
          "settings": {
            "foreground": "#40a02b"
          }
        },
        {
          "scope": [
            "keyword.other.definition.ini",
            "punctuation.support.type.property-name.json",
            "support.type.property-name.json",
            "punctuation.support.type.property-name.toml",
            "support.type.property-name.toml",
            "entity.name.tag.yaml",
            "punctuation.support.type.property-name.yaml",
            "support.type.property-name.yaml"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": [
            "constant.language.json",
            "constant.language.yaml"
          ],
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": [
            "entity.name.type.anchor.yaml",
            "variable.other.alias.yaml"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": [
            "support.type.property-name.table",
            "entity.name.section.group-title.ini"
          ],
          "settings": {
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": "constant.other.time.datetime.offset.toml",
          "settings": {
            "foreground": "#ea76cb"
          }
        },
        {
          "scope": [
            "punctuation.definition.anchor.yaml",
            "punctuation.definition.alias.yaml"
          ],
          "settings": {
            "foreground": "#ea76cb"
          }
        },
        {
          "scope": "entity.other.document.begin.yaml",
          "settings": {
            "foreground": "#ea76cb"
          }
        },
        {
          "scope": "markup.changed.diff",
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": [
            "meta.diff.header.from-file",
            "meta.diff.header.to-file",
            "punctuation.definition.from-file.diff",
            "punctuation.definition.to-file.diff"
          ],
          "settings": {
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": "markup.inserted.diff",
          "settings": {
            "foreground": "#40a02b"
          }
        },
        {
          "scope": "markup.deleted.diff",
          "settings": {
            "foreground": "#d20f39"
          }
        },
        {
          "scope": [
            "variable.other.env"
          ],
          "settings": {
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": [
            "string.quoted variable.other.env"
          ],
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": "support.function.builtin.gdscript",
          "settings": {
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": "constant.language.gdscript",
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": "comment meta.annotation.go",
          "settings": {
            "foreground": "#e64553"
          }
        },
        {
          "scope": "comment meta.annotation.parameters.go",
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": "constant.language.go",
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": "variable.graphql",
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": "string.unquoted.alias.graphql",
          "settings": {
            "foreground": "#dd7878"
          }
        },
        {
          "scope": "constant.character.enum.graphql",
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": "meta.objectvalues.graphql constant.object.key.graphql string.unquoted.graphql",
          "settings": {
            "foreground": "#dd7878"
          }
        },
        {
          "scope": [
            "keyword.other.doctype",
            "meta.tag.sgml.doctype punctuation.definition.tag",
            "meta.tag.metadata.doctype entity.name.tag",
            "meta.tag.metadata.doctype punctuation.definition.tag"
          ],
          "settings": {
            "foreground": "#8839ef"
          }
        },
        {
          "scope": [
            "entity.name.tag"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": [
            "text.html constant.character.entity",
            "text.html constant.character.entity punctuation",
            "constant.character.entity.xml",
            "constant.character.entity.xml punctuation",
            "constant.character.entity.js.jsx",
            "constant.charactger.entity.js.jsx punctuation",
            "constant.character.entity.tsx",
            "constant.character.entity.tsx punctuation"
          ],
          "settings": {
            "foreground": "#d20f39"
          }
        },
        {
          "scope": [
            "entity.other.attribute-name"
          ],
          "settings": {
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": [
            "support.class.component",
            "support.class.component.jsx",
            "support.class.component.tsx",
            "support.class.component.vue"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#ea76cb"
          }
        },
        {
          "scope": [
            "punctuation.definition.annotation",
            "storage.type.annotation"
          ],
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": "constant.other.enum.java",
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": "storage.modifier.import.java",
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": "comment.block.javadoc.java keyword.other.documentation.javadoc.java",
          "settings": {
            "fontStyle": ""
          }
        },
        {
          "scope": "meta.export variable.other.readwrite.js",
          "settings": {
            "foreground": "#e64553"
          }
        },
        {
          "scope": [
            "variable.other.constant.js",
            "variable.other.constant.ts",
            "variable.other.property.js",
            "variable.other.property.ts"
          ],
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": [
            "variable.other.jsdoc",
            "comment.block.documentation variable.other"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#e64553"
          }
        },
        {
          "scope": "storage.type.class.jsdoc",
          "settings": {
            "fontStyle": ""
          }
        },
        {
          "scope": "support.type.object.console.js",
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": [
            "support.constant.node",
            "support.type.object.module.js"
          ],
          "settings": {
            "foreground": "#8839ef"
          }
        },
        {
          "scope": "storage.modifier.implements",
          "settings": {
            "foreground": "#8839ef"
          }
        },
        {
          "scope": [
            "constant.language.null.js",
            "constant.language.null.ts",
            "constant.language.undefined.js",
            "constant.language.undefined.ts",
            "support.type.builtin.ts"
          ],
          "settings": {
            "foreground": "#8839ef"
          }
        },
        {
          "scope": "variable.parameter.generic",
          "settings": {
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": [
            "keyword.declaration.function.arrow.js",
            "storage.type.function.arrow.ts"
          ],
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": "punctuation.decorator.ts",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": [
            "keyword.operator.expression.in.js",
            "keyword.operator.expression.in.ts",
            "keyword.operator.expression.infer.ts",
            "keyword.operator.expression.instanceof.js",
            "keyword.operator.expression.instanceof.ts",
            "keyword.operator.expression.is",
            "keyword.operator.expression.keyof.ts",
            "keyword.operator.expression.of.js",
            "keyword.operator.expression.of.ts",
            "keyword.operator.expression.typeof.ts"
          ],
          "settings": {
            "foreground": "#8839ef"
          }
        },
        {
          "scope": "support.function.macro.julia",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#179299"
          }
        },
        {
          "scope": "constant.language.julia",
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": "constant.other.symbol.julia",
          "settings": {
            "foreground": "#e64553"
          }
        },
        {
          "scope": "text.tex keyword.control.preamble",
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": "text.tex support.function.be",
          "settings": {
            "foreground": "#04a5e5"
          }
        },
        {
          "scope": "constant.other.general.math.tex",
          "settings": {
            "foreground": "#dd7878"
          }
        },
        {
          "scope": "variable.language.liquid",
          "settings": {
            "foreground": "#ea76cb"
          }
        },
        {
          "scope": "comment.line.double-dash.documentation.lua storage.type.annotation.lua",
          "settings": {
            "fontStyle": "",
            "foreground": "#8839ef"
          }
        },
        {
          "scope": [
            "comment.line.double-dash.documentation.lua entity.name.variable.lua",
            "comment.line.double-dash.documentation.lua variable.lua"
          ],
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": [
            "heading.1.markdown punctuation.definition.heading.markdown",
            "heading.1.markdown",
            "heading.1.quarto punctuation.definition.heading.quarto",
            "heading.1.quarto",
            "markup.heading.atx.1.mdx",
            "markup.heading.atx.1.mdx punctuation.definition.heading.mdx",
            "markup.heading.setext.1.markdown",
            "markup.heading.heading-0.asciidoc"
          ],
          "settings": {
            "foreground": "#d20f39"
          }
        },
        {
          "scope": [
            "heading.2.markdown punctuation.definition.heading.markdown",
            "heading.2.markdown",
            "heading.2.quarto punctuation.definition.heading.quarto",
            "heading.2.quarto",
            "markup.heading.atx.2.mdx",
            "markup.heading.atx.2.mdx punctuation.definition.heading.mdx",
            "markup.heading.setext.2.markdown",
            "markup.heading.heading-1.asciidoc"
          ],
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": [
            "heading.3.markdown punctuation.definition.heading.markdown",
            "heading.3.markdown",
            "heading.3.quarto punctuation.definition.heading.quarto",
            "heading.3.quarto",
            "markup.heading.atx.3.mdx",
            "markup.heading.atx.3.mdx punctuation.definition.heading.mdx",
            "markup.heading.heading-2.asciidoc"
          ],
          "settings": {
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": [
            "heading.4.markdown punctuation.definition.heading.markdown",
            "heading.4.markdown",
            "heading.4.quarto punctuation.definition.heading.quarto",
            "heading.4.quarto",
            "markup.heading.atx.4.mdx",
            "markup.heading.atx.4.mdx punctuation.definition.heading.mdx",
            "markup.heading.heading-3.asciidoc"
          ],
          "settings": {
            "foreground": "#40a02b"
          }
        },
        {
          "scope": [
            "heading.5.markdown punctuation.definition.heading.markdown",
            "heading.5.markdown",
            "heading.5.quarto punctuation.definition.heading.quarto",
            "heading.5.quarto",
            "markup.heading.atx.5.mdx",
            "markup.heading.atx.5.mdx punctuation.definition.heading.mdx",
            "markup.heading.heading-4.asciidoc"
          ],
          "settings": {
            "foreground": "#209fb5"
          }
        },
        {
          "scope": [
            "heading.6.markdown punctuation.definition.heading.markdown",
            "heading.6.markdown",
            "heading.6.quarto punctuation.definition.heading.quarto",
            "heading.6.quarto",
            "markup.heading.atx.6.mdx",
            "markup.heading.atx.6.mdx punctuation.definition.heading.mdx",
            "markup.heading.heading-5.asciidoc"
          ],
          "settings": {
            "foreground": "#7287fd"
          }
        },
        {
          "scope": "markup.bold",
          "settings": {
            "fontStyle": "bold",
            "foreground": "#d20f39"
          }
        },
        {
          "scope": "markup.italic",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#d20f39"
          }
        },
        {
          "scope": "markup.strikethrough",
          "settings": {
            "fontStyle": "strikethrough",
            "foreground": "#6c6f85"
          }
        },
        {
          "scope": [
            "punctuation.definition.link",
            "markup.underline.link"
          ],
          "settings": {
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": [
            "text.html.markdown punctuation.definition.link.title",
            "text.html.quarto punctuation.definition.link.title",
            "string.other.link.title.markdown",
            "string.other.link.title.quarto",
            "markup.link",
            "punctuation.definition.constant.markdown",
            "punctuation.definition.constant.quarto",
            "constant.other.reference.link.markdown",
            "constant.other.reference.link.quarto",
            "markup.substitution.attribute-reference"
          ],
          "settings": {
            "foreground": "#7287fd"
          }
        },
        {
          "scope": [
            "punctuation.definition.raw.markdown",
            "punctuation.definition.raw.quarto",
            "markup.inline.raw.string.markdown",
            "markup.inline.raw.string.quarto",
            "markup.raw.block.markdown",
            "markup.raw.block.quarto"
          ],
          "settings": {
            "foreground": "#40a02b"
          }
        },
        {
          "scope": "fenced_code.block.language",
          "settings": {
            "foreground": "#04a5e5"
          }
        },
        {
          "scope": [
            "markup.fenced_code.block punctuation.definition",
            "markup.raw support.asciidoc"
          ],
          "settings": {
            "foreground": "#7c7f93"
          }
        },
        {
          "scope": [
            "markup.quote",
            "punctuation.definition.quote.begin"
          ],
          "settings": {
            "foreground": "#ea76cb"
          }
        },
        {
          "scope": "meta.separator.markdown",
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": [
            "punctuation.definition.list.begin.markdown",
            "punctuation.definition.list.begin.quarto",
            "markup.list.bullet"
          ],
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": "markup.heading.quarto",
          "settings": {
            "fontStyle": "bold"
          }
        },
        {
          "scope": [
            "entity.other.attribute-name.multipart.nix",
            "entity.other.attribute-name.single.nix"
          ],
          "settings": {
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": "variable.parameter.name.nix",
          "settings": {
            "fontStyle": "",
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": "meta.embedded variable.parameter.name.nix",
          "settings": {
            "fontStyle": "",
            "foreground": "#7287fd"
          }
        },
        {
          "scope": "string.unquoted.path.nix",
          "settings": {
            "fontStyle": "",
            "foreground": "#ea76cb"
          }
        },
        {
          "scope": [
            "support.attribute.builtin",
            "meta.attribute.php"
          ],
          "settings": {
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": "meta.function.parameters.php punctuation.definition.variable.php",
          "settings": {
            "foreground": "#e64553"
          }
        },
        {
          "scope": "constant.language.php",
          "settings": {
            "foreground": "#8839ef"
          }
        },
        {
          "scope": "text.html.php support.function",
          "settings": {
            "foreground": "#04a5e5"
          }
        },
        {
          "scope": "keyword.other.phpdoc.php",
          "settings": {
            "fontStyle": ""
          }
        },
        {
          "scope": [
            "support.variable.magic.python",
            "meta.function-call.arguments.python"
          ],
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": [
            "support.function.magic.python"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#04a5e5"
          }
        },
        {
          "scope": [
            "variable.parameter.function.language.special.self.python",
            "variable.language.special.self.python"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#d20f39"
          }
        },
        {
          "scope": [
            "keyword.control.flow.python",
            "keyword.operator.logical.python"
          ],
          "settings": {
            "foreground": "#8839ef"
          }
        },
        {
          "scope": "storage.type.function.python",
          "settings": {
            "foreground": "#8839ef"
          }
        },
        {
          "scope": [
            "support.token.decorator.python",
            "meta.function.decorator.identifier.python"
          ],
          "settings": {
            "foreground": "#04a5e5"
          }
        },
        {
          "scope": [
            "meta.function-call.python"
          ],
          "settings": {
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": [
            "entity.name.function.decorator.python",
            "punctuation.definition.decorator.python"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#fe640b"
          }
        },
        {
          "scope": "constant.character.format.placeholder.other.python",
          "settings": {
            "foreground": "#ea76cb"
          }
        },
        {
          "scope": [
            "support.type.exception.python",
            "support.function.builtin.python"
          ],
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": [
            "support.type.python"
          ],
          "settings": {
            "foreground": "#8839ef"
          }
        },
        {
          "scope": "constant.language.python",
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": [
            "meta.indexed-name.python",
            "meta.item-access.python"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#e64553"
          }
        },
        {
          "scope": "storage.type.string.python",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#40a02b"
          }
        },
        {
          "scope": "meta.function.parameters.python",
          "settings": {
            "fontStyle": ""
          }
        },
        {
          "scope": "meta.function-call.r",
          "settings": {
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": "meta.function-call.arguments.r",
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": [
            "string.regexp punctuation.definition.string.begin",
            "string.regexp punctuation.definition.string.end"
          ],
          "settings": {
            "foreground": "#ea76cb"
          }
        },
        {
          "scope": "keyword.control.anchor.regexp",
          "settings": {
            "foreground": "#8839ef"
          }
        },
        {
          "scope": "string.regexp.ts",
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": [
            "punctuation.definition.group.regexp",
            "keyword.other.back-reference.regexp"
          ],
          "settings": {
            "foreground": "#40a02b"
          }
        },
        {
          "scope": "punctuation.definition.character-class.regexp",
          "settings": {
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": "constant.other.character-class.regexp",
          "settings": {
            "foreground": "#ea76cb"
          }
        },
        {
          "scope": "constant.other.character-class.range.regexp",
          "settings": {
            "foreground": "#dc8a78"
          }
        },
        {
          "scope": "keyword.operator.quantifier.regexp",
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": "constant.character.numeric.regexp",
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": [
            "punctuation.definition.group.no-capture.regexp",
            "meta.assertion.look-ahead.regexp",
            "meta.assertion.negative-look-ahead.regexp"
          ],
          "settings": {
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": [
            "meta.annotation.rust",
            "meta.annotation.rust punctuation",
            "meta.attribute.rust",
            "punctuation.definition.attribute.rust"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": [
            "meta.attribute.rust string.quoted.double.rust",
            "meta.attribute.rust string.quoted.single.char.rust"
          ],
          "settings": {
            "fontStyle": ""
          }
        },
        {
          "scope": [
            "entity.name.function.macro.rules.rust",
            "storage.type.module.rust",
            "storage.modifier.rust",
            "storage.type.struct.rust",
            "storage.type.enum.rust",
            "storage.type.trait.rust",
            "storage.type.union.rust",
            "storage.type.impl.rust",
            "storage.type.rust",
            "storage.type.function.rust",
            "storage.type.type.rust"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#8839ef"
          }
        },
        {
          "scope": "entity.name.type.numeric.rust",
          "settings": {
            "fontStyle": "",
            "foreground": "#8839ef"
          }
        },
        {
          "scope": "meta.generic.rust",
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": "entity.name.impl.rust",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": "entity.name.module.rust",
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": "entity.name.trait.rust",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": "storage.type.source.rust",
          "settings": {
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": "entity.name.union.rust",
          "settings": {
            "foreground": "#df8e1d"
          }
        },
        {
          "scope": "meta.enum.rust storage.type.source.rust",
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": [
            "support.macro.rust",
            "meta.macro.rust support.function.rust",
            "entity.name.function.macro.rust"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": [
            "storage.modifier.lifetime.rust",
            "entity.name.type.lifetime"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": "string.quoted.double.rust constant.other.placeholder.rust",
          "settings": {
            "foreground": "#ea76cb"
          }
        },
        {
          "scope": "meta.function.return-type.rust meta.generic.rust storage.type.rust",
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": "meta.function.call.rust",
          "settings": {
            "foreground": "#1e66f5"
          }
        },
        {
          "scope": "punctuation.brackets.angle.rust",
          "settings": {
            "foreground": "#04a5e5"
          }
        },
        {
          "scope": "constant.other.caps.rust",
          "settings": {
            "foreground": "#fe640b"
          }
        },
        {
          "scope": [
            "meta.function.definition.rust variable.other.rust"
          ],
          "settings": {
            "foreground": "#e64553"
          }
        },
        {
          "scope": "meta.function.call.rust variable.other.rust",
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": "variable.language.self.rust",
          "settings": {
            "foreground": "#d20f39"
          }
        },
        {
          "scope": [
            "variable.other.metavariable.name.rust",
            "meta.macro.metavariable.rust keyword.operator.macro.dollar.rust"
          ],
          "settings": {
            "foreground": "#ea76cb"
          }
        },
        {
          "scope": [
            "comment.line.shebang",
            "comment.line.shebang punctuation.definition.comment",
            "comment.line.shebang",
            "punctuation.definition.comment.shebang.shell",
            "meta.shebang.shell"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#ea76cb"
          }
        },
        {
          "scope": "comment.line.shebang constant.language",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#179299"
          }
        },
        {
          "scope": [
            "meta.function-call.arguments.shell punctuation.definition.variable.shell",
            "meta.function-call.arguments.shell punctuation.section.interpolation",
            "meta.function-call.arguments.shell punctuation.definition.variable.shell",
            "meta.function-call.arguments.shell punctuation.section.interpolation"
          ],
          "settings": {
            "foreground": "#d20f39"
          }
        },
        {
          "scope": "meta.string meta.interpolation.parameter.shell variable.other.readwrite",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#fe640b"
          }
        },
        {
          "scope": [
            "source.shell punctuation.section.interpolation",
            "punctuation.definition.evaluation.backticks.shell"
          ],
          "settings": {
            "foreground": "#179299"
          }
        },
        {
          "scope": "entity.name.tag.heredoc.shell",
          "settings": {
            "foreground": "#8839ef"
          }
        },
        {
          "scope": "string.quoted.double.shell variable.other.normal.shell",
          "settings": {
            "foreground": "#4c4f69"
          }
        },
        {
          "scope": [
            "markup.heading.typst"
          ],
          "settings": {
            "foreground": "#d20f39"
          }
        }
      ],
      "type": "light"
    },
    "dark": {
      "colors": {
        "activityBar.activeBackground": "#00000000",
        "activityBar.activeBorder": "#00000000",
        "activityBar.activeFocusBorder": "#00000000",
        "activityBar.background": "#232634",
        "activityBar.border": "#00000000",
        "activityBar.dropBorder": "#ca9ee633",
        "activityBar.foreground": "#ca9ee6",
        "activityBar.inactiveForeground": "#737994",
        "activityBarBadge.background": "#ca9ee6",
        "activityBarBadge.foreground": "#232634",
        "activityBarTop.activeBorder": "#00000000",
        "activityBarTop.dropBorder": "#ca9ee633",
        "activityBarTop.foreground": "#ca9ee6",
        "activityBarTop.inactiveForeground": "#737994",
        "badge.background": "#51576d",
        "badge.foreground": "#c6d0f5",
        "banner.background": "#51576d",
        "banner.foreground": "#c6d0f5",
        "banner.iconForeground": "#c6d0f5",
        "breadcrumb.activeSelectionForeground": "#ca9ee6",
        "breadcrumb.background": "#303446",
        "breadcrumb.focusForeground": "#ca9ee6",
        "breadcrumb.foreground": "#c6d0f5cc",
        "breadcrumbPicker.background": "#292c3c",
        "button.background": "#ca9ee6",
        "button.border": "#00000000",
        "button.foreground": "#232634",
        "button.hoverBackground": "#d9baed",
        "button.secondaryBackground": "#626880",
        "button.secondaryBorder": "#ca9ee6",
        "button.secondaryForeground": "#c6d0f5",
        "button.secondaryHoverBackground": "#727993",
        "button.separator": "#00000000",
        "charts.blue": "#8caaee",
        "charts.foreground": "#c6d0f5",
        "charts.green": "#a6d189",
        "charts.lines": "#b5bfe2",
        "charts.orange": "#ef9f76",
        "charts.purple": "#ca9ee6",
        "charts.red": "#e78284",
        "charts.yellow": "#e5c890",
        "checkbox.background": "#51576d",
        "checkbox.border": "#00000000",
        "checkbox.foreground": "#ca9ee6",
        "commandCenter.activeBackground": "#62688033",
        "commandCenter.activeBorder": "#ca9ee6",
        "commandCenter.activeForeground": "#ca9ee6",
        "commandCenter.background": "#292c3c",
        "commandCenter.border": "#00000000",
        "commandCenter.foreground": "#b5bfe2",
        "commandCenter.inactiveBorder": "#00000000",
        "commandCenter.inactiveForeground": "#b5bfe2",
        "debugConsole.errorForeground": "#e78284",
        "debugConsole.infoForeground": "#8caaee",
        "debugConsole.sourceForeground": "#f2d5cf",
        "debugConsole.warningForeground": "#ef9f76",
        "debugConsoleInputIcon.foreground": "#c6d0f5",
        "debugExceptionWidget.background": "#232634",
        "debugExceptionWidget.border": "#ca9ee6",
        "debugIcon.breakpointCurrentStackframeForeground": "#626880",
        "debugIcon.breakpointDisabledForeground": "#e7828499",
        "debugIcon.breakpointForeground": "#e78284",
        "debugIcon.breakpointStackframeForeground": "#626880",
        "debugIcon.breakpointUnverifiedForeground": "#a57582",
        "debugIcon.continueForeground": "#a6d189",
        "debugIcon.disconnectForeground": "#626880",
        "debugIcon.pauseForeground": "#8caaee",
        "debugIcon.restartForeground": "#81c8be",
        "debugIcon.startForeground": "#a6d189",
        "debugIcon.stepBackForeground": "#626880",
        "debugIcon.stepIntoForeground": "#c6d0f5",
        "debugIcon.stepOutForeground": "#c6d0f5",
        "debugIcon.stepOverForeground": "#ca9ee6",
        "debugIcon.stopForeground": "#e78284",
        "debugTokenExpression.boolean": "#ca9ee6",
        "debugTokenExpression.error": "#e78284",
        "debugTokenExpression.number": "#ef9f76",
        "debugTokenExpression.string": "#a6d189",
        "debugToolBar.background": "#232634",
        "debugToolBar.border": "#00000000",
        "descriptionForeground": "#c6d0f5",
        "diffEditor.border": "#626880",
        "diffEditor.diagonalFill": "#62688099",
        "diffEditor.insertedLineBackground": "#a6d18926",
        "diffEditor.insertedTextBackground": "#a6d18933",
        "diffEditor.removedLineBackground": "#e7828426",
        "diffEditor.removedTextBackground": "#e7828433",
        "diffEditorOverview.insertedForeground": "#a6d189cc",
        "diffEditorOverview.removedForeground": "#e78284cc",
        "disabledForeground": "#a5adce",
        "dropdown.background": "#292c3c",
        "dropdown.border": "#ca9ee6",
        "dropdown.foreground": "#c6d0f5",
        "dropdown.listBackground": "#626880",
        "editor.background": "#303446",
        "editor.findMatchBackground": "#674b59",
        "editor.findMatchBorder": "#e7828433",
        "editor.findMatchHighlightBackground": "#506373",
        "editor.findMatchHighlightBorder": "#99d1db33",
        "editor.findRangeHighlightBackground": "#506373",
        "editor.findRangeHighlightBorder": "#99d1db33",
        "editor.focusedStackFrameHighlightBackground": "#a6d18926",
        "editor.foldBackground": "#99d1db40",
        "editor.foreground": "#c6d0f5",
        "editor.hoverHighlightBackground": "#99d1db40",
        "editor.lineHighlightBackground": "#c6d0f512",
        "editor.lineHighlightBorder": "#00000000",
        "editor.rangeHighlightBackground": "#99d1db40",
        "editor.rangeHighlightBorder": "#00000000",
        "editor.selectionBackground": "#949cbb40",
        "editor.selectionHighlightBackground": "#949cbb33",
        "editor.selectionHighlightBorder": "#949cbb33",
        "editor.stackFrameHighlightBackground": "#e5c89026",
        "editor.wordHighlightBackground": "#949cbb33",
        "editor.wordHighlightStrongBackground": "#8caaee33",
        "editorBracketHighlight.foreground1": "#e78284",
        "editorBracketHighlight.foreground2": "#ef9f76",
        "editorBracketHighlight.foreground3": "#e5c890",
        "editorBracketHighlight.foreground4": "#a6d189",
        "editorBracketHighlight.foreground5": "#85c1dc",
        "editorBracketHighlight.foreground6": "#ca9ee6",
        "editorBracketHighlight.unexpectedBracket.foreground": "#ea999c",
        "editorBracketMatch.background": "#949cbb1a",
        "editorBracketMatch.border": "#949cbb",
        "editorCodeLens.foreground": "#838ba7",
        "editorCursor.background": "#303446",
        "editorCursor.foreground": "#f2d5cf",
        "editorError.background": "#00000000",
        "editorError.border": "#00000000",
        "editorError.foreground": "#e78284",
        "editorGroup.border": "#626880",
        "editorGroup.dropBackground": "#ca9ee633",
        "editorGroup.emptyBackground": "#303446",
        "editorGroupHeader.tabsBackground": "#232634",
        "editorGutter.addedBackground": "#a6d189",
        "editorGutter.background": "#303446",
        "editorGutter.commentGlyphForeground": "#ca9ee6",
        "editorGutter.commentRangeForeground": "#414559",
        "editorGutter.deletedBackground": "#e78284",
        "editorGutter.foldingControlForeground": "#949cbb",
        "editorGutter.modifiedBackground": "#e5c890",
        "editorHoverWidget.background": "#292c3c",
        "editorHoverWidget.border": "#626880",
        "editorHoverWidget.foreground": "#c6d0f5",
        "editorIndentGuide.activeBackground": "#626880",
        "editorIndentGuide.background": "#51576d",
        "editorInfo.background": "#00000000",
        "editorInfo.border": "#00000000",
        "editorInfo.foreground": "#8caaee",
        "editorInlayHint.background": "#292c3cbf",
        "editorInlayHint.foreground": "#626880",
        "editorInlayHint.parameterBackground": "#292c3cbf",
        "editorInlayHint.parameterForeground": "#a5adce",
        "editorInlayHint.typeBackground": "#292c3cbf",
        "editorInlayHint.typeForeground": "#b5bfe2",
        "editorLightBulb.foreground": "#e5c890",
        "editorLineNumber.activeForeground": "#ca9ee6",
        "editorLineNumber.foreground": "#838ba7",
        "editorLink.activeForeground": "#ca9ee6",
        "editorMarkerNavigation.background": "#292c3c",
        "editorMarkerNavigationError.background": "#e78284",
        "editorMarkerNavigationInfo.background": "#8caaee",
        "editorMarkerNavigationWarning.background": "#ef9f76",
        "editorOverviewRuler.background": "#292c3c",
        "editorOverviewRuler.border": "#c6d0f512",
        "editorOverviewRuler.modifiedForeground": "#e5c890",
        "editorRuler.foreground": "#626880",
        "editorStickyScrollHover.background": "#414559",
        "editorSuggestWidget.background": "#292c3c",
        "editorSuggestWidget.border": "#626880",
        "editorSuggestWidget.foreground": "#c6d0f5",
        "editorSuggestWidget.highlightForeground": "#ca9ee6",
        "editorSuggestWidget.selectedBackground": "#414559",
        "editorWarning.background": "#00000000",
        "editorWarning.border": "#00000000",
        "editorWarning.foreground": "#ef9f76",
        "editorWhitespace.foreground": "#949cbb66",
        "editorWidget.background": "#292c3c",
        "editorWidget.foreground": "#c6d0f5",
        "editorWidget.resizeBorder": "#626880",
        "errorForeground": "#e78284",
        "errorLens.errorBackground": "#e7828426",
        "errorLens.errorBackgroundLight": "#e7828426",
        "errorLens.errorForeground": "#e78284",
        "errorLens.errorForegroundLight": "#e78284",
        "errorLens.errorMessageBackground": "#e7828426",
        "errorLens.hintBackground": "#a6d18926",
        "errorLens.hintBackgroundLight": "#a6d18926",
        "errorLens.hintForeground": "#a6d189",
        "errorLens.hintForegroundLight": "#a6d189",
        "errorLens.hintMessageBackground": "#a6d18926",
        "errorLens.infoBackground": "#8caaee26",
        "errorLens.infoBackgroundLight": "#8caaee26",
        "errorLens.infoForeground": "#8caaee",
        "errorLens.infoForegroundLight": "#8caaee",
        "errorLens.infoMessageBackground": "#8caaee26",
        "errorLens.statusBarErrorForeground": "#e78284",
        "errorLens.statusBarHintForeground": "#a6d189",
        "errorLens.statusBarIconErrorForeground": "#e78284",
        "errorLens.statusBarIconWarningForeground": "#ef9f76",
        "errorLens.statusBarInfoForeground": "#8caaee",
        "errorLens.statusBarWarningForeground": "#ef9f76",
        "errorLens.warningBackground": "#ef9f7626",
        "errorLens.warningBackgroundLight": "#ef9f7626",
        "errorLens.warningForeground": "#ef9f76",
        "errorLens.warningForegroundLight": "#ef9f76",
        "errorLens.warningMessageBackground": "#ef9f7626",
        "extensionBadge.remoteBackground": "#8caaee",
        "extensionBadge.remoteForeground": "#232634",
        "extensionButton.prominentBackground": "#ca9ee6",
        "extensionButton.prominentForeground": "#232634",
        "extensionButton.prominentHoverBackground": "#d9baed",
        "extensionButton.separator": "#303446",
        "extensionIcon.preReleaseForeground": "#626880",
        "extensionIcon.sponsorForeground": "#f4b8e4",
        "extensionIcon.starForeground": "#e5c890",
        "extensionIcon.verifiedForeground": "#a6d189",
        "focusBorder": "#ca9ee6",
        "foreground": "#c6d0f5",
        "gitDecoration.addedResourceForeground": "#a6d189",
        "gitDecoration.conflictingResourceForeground": "#ca9ee6",
        "gitDecoration.deletedResourceForeground": "#e78284",
        "gitDecoration.ignoredResourceForeground": "#737994",
        "gitDecoration.modifiedResourceForeground": "#e5c890",
        "gitDecoration.stageDeletedResourceForeground": "#e78284",
        "gitDecoration.stageModifiedResourceForeground": "#e5c890",
        "gitDecoration.submoduleResourceForeground": "#8caaee",
        "gitDecoration.untrackedResourceForeground": "#a6d189",
        "gitlens.closedAutolinkedIssueIconColor": "#ca9ee6",
        "gitlens.closedPullRequestIconColor": "#e78284",
        "gitlens.decorations.branchAheadForegroundColor": "#a6d189",
        "gitlens.decorations.branchBehindForegroundColor": "#ef9f76",
        "gitlens.decorations.branchDivergedForegroundColor": "#e5c890",
        "gitlens.decorations.branchMissingUpstreamForegroundColor": "#ef9f76",
        "gitlens.decorations.branchUnpublishedForegroundColor": "#a6d189",
        "gitlens.decorations.statusMergingOrRebasingConflictForegroundColor": "#ea999c",
        "gitlens.decorations.statusMergingOrRebasingForegroundColor": "#e5c890",
        "gitlens.decorations.workspaceCurrentForegroundColor": "#ca9ee6",
        "gitlens.decorations.workspaceRepoMissingForegroundColor": "#a5adce",
        "gitlens.decorations.workspaceRepoOpenForegroundColor": "#ca9ee6",
        "gitlens.decorations.worktreeHasUncommittedChangesForegroundColor": "#ef9f76",
        "gitlens.decorations.worktreeMissingForegroundColor": "#ea999c",
        "gitlens.graphChangesColumnAddedColor": "#a6d189",
        "gitlens.graphChangesColumnDeletedColor": "#e78284",
        "gitlens.graphLane10Color": "#f4b8e4",
        "gitlens.graphLane1Color": "#ca9ee6",
        "gitlens.graphLane2Color": "#e5c890",
        "gitlens.graphLane3Color": "#8caaee",
        "gitlens.graphLane4Color": "#eebebe",
        "gitlens.graphLane5Color": "#a6d189",
        "gitlens.graphLane6Color": "#babbf1",
        "gitlens.graphLane7Color": "#f2d5cf",
        "gitlens.graphLane8Color": "#e78284",
        "gitlens.graphLane9Color": "#81c8be",
        "gitlens.graphMinimapMarkerHeadColor": "#a6d189",
        "gitlens.graphMinimapMarkerHighlightsColor": "#e5c890",
        "gitlens.graphMinimapMarkerLocalBranchesColor": "#8caaee",
        "gitlens.graphMinimapMarkerRemoteBranchesColor": "#769aeb",
        "gitlens.graphMinimapMarkerStashesColor": "#ca9ee6",
        "gitlens.graphMinimapMarkerTagsColor": "#eebebe",
        "gitlens.graphMinimapMarkerUpstreamColor": "#98ca77",
        "gitlens.graphScrollMarkerHeadColor": "#a6d189",
        "gitlens.graphScrollMarkerHighlightsColor": "#e5c890",
        "gitlens.graphScrollMarkerLocalBranchesColor": "#8caaee",
        "gitlens.graphScrollMarkerRemoteBranchesColor": "#769aeb",
        "gitlens.graphScrollMarkerStashesColor": "#ca9ee6",
        "gitlens.graphScrollMarkerTagsColor": "#eebebe",
        "gitlens.graphScrollMarkerUpstreamColor": "#98ca77",
        "gitlens.gutterBackgroundColor": "#4145594d",
        "gitlens.gutterForegroundColor": "#c6d0f5",
        "gitlens.gutterUncommittedForegroundColor": "#ca9ee6",
        "gitlens.lineHighlightBackgroundColor": "#ca9ee626",
        "gitlens.lineHighlightOverviewRulerColor": "#ca9ee6cc",
        "gitlens.mergedPullRequestIconColor": "#ca9ee6",
        "gitlens.openAutolinkedIssueIconColor": "#a6d189",
        "gitlens.openPullRequestIconColor": "#a6d189",
        "gitlens.trailingLineBackgroundColor": "#00000000",
        "gitlens.trailingLineForegroundColor": "#c6d0f54d",
        "gitlens.unpublishedChangesIconColor": "#a6d189",
        "gitlens.unpublishedCommitIconColor": "#a6d189",
        "gitlens.unpulledChangesIconColor": "#ef9f76",
        "icon.foreground": "#ca9ee6",
        "input.background": "#414559",
        "input.border": "#00000000",
        "input.foreground": "#c6d0f5",
        "input.placeholderForeground": "#c6d0f573",
        "inputOption.activeBackground": "#626880",
        "inputOption.activeBorder": "#ca9ee6",
        "inputOption.activeForeground": "#c6d0f5",
        "inputValidation.errorBackground": "#e78284",
        "inputValidation.errorBorder": "#23263433",
        "inputValidation.errorForeground": "#232634",
        "inputValidation.infoBackground": "#8caaee",
        "inputValidation.infoBorder": "#23263433",
        "inputValidation.infoForeground": "#232634",
        "inputValidation.warningBackground": "#ef9f76",
        "inputValidation.warningBorder": "#23263433",
        "inputValidation.warningForeground": "#232634",
        "issues.closed": "#ca9ee6",
        "issues.newIssueDecoration": "#f2d5cf",
        "issues.open": "#a6d189",
        "list.activeSelectionBackground": "#414559",
        "list.activeSelectionForeground": "#c6d0f5",
        "list.dropBackground": "#ca9ee633",
        "list.focusAndSelectionBackground": "#51576d",
        "list.focusBackground": "#414559",
        "list.focusForeground": "#c6d0f5",
        "list.focusOutline": "#00000000",
        "list.highlightForeground": "#ca9ee6",
        "list.hoverBackground": "#41455980",
        "list.hoverForeground": "#c6d0f5",
        "list.inactiveSelectionBackground": "#414559",
        "list.inactiveSelectionForeground": "#c6d0f5",
        "list.warningForeground": "#ef9f76",
        "listFilterWidget.background": "#51576d",
        "listFilterWidget.noMatchesOutline": "#e78284",
        "listFilterWidget.outline": "#00000000",
        "menu.background": "#303446",
        "menu.border": "#30344680",
        "menu.foreground": "#c6d0f5",
        "menu.selectionBackground": "#626880",
        "menu.selectionBorder": "#00000000",
        "menu.selectionForeground": "#c6d0f5",
        "menu.separatorBackground": "#626880",
        "menubar.selectionBackground": "#51576d",
        "menubar.selectionForeground": "#c6d0f5",
        "merge.commonContentBackground": "#51576d",
        "merge.commonHeaderBackground": "#626880",
        "merge.currentContentBackground": "#a6d18933",
        "merge.currentHeaderBackground": "#a6d18966",
        "merge.incomingContentBackground": "#8caaee33",
        "merge.incomingHeaderBackground": "#8caaee66",
        "minimap.background": "#292c3c80",
        "minimap.errorHighlight": "#e78284bf",
        "minimap.findMatchHighlight": "#99d1db4d",
        "minimap.selectionHighlight": "#626880bf",
        "minimap.selectionOccurrenceHighlight": "#626880bf",
        "minimap.warningHighlight": "#ef9f76bf",
        "minimapGutter.addedBackground": "#a6d189bf",
        "minimapGutter.deletedBackground": "#e78284bf",
        "minimapGutter.modifiedBackground": "#e5c890bf",
        "minimapSlider.activeBackground": "#ca9ee699",
        "minimapSlider.background": "#ca9ee633",
        "minimapSlider.hoverBackground": "#ca9ee666",
        "notificationCenter.border": "#ca9ee6",
        "notificationCenterHeader.background": "#292c3c",
        "notificationCenterHeader.foreground": "#c6d0f5",
        "notificationLink.foreground": "#8caaee",
        "notificationToast.border": "#ca9ee6",
        "notifications.background": "#292c3c",
        "notifications.border": "#ca9ee6",
        "notifications.foreground": "#c6d0f5",
        "notificationsErrorIcon.foreground": "#e78284",
        "notificationsInfoIcon.foreground": "#8caaee",
        "notificationsWarningIcon.foreground": "#ef9f76",
        "panel.background": "#303446",
        "panel.border": "#626880",
        "panelSection.border": "#626880",
        "panelSection.dropBackground": "#ca9ee633",
        "panelTitle.activeBorder": "#ca9ee6",
        "panelTitle.activeForeground": "#c6d0f5",
        "panelTitle.inactiveForeground": "#a5adce",
        "peekView.border": "#ca9ee6",
        "peekViewEditor.background": "#292c3c",
        "peekViewEditor.matchHighlightBackground": "#99d1db4d",
        "peekViewEditor.matchHighlightBorder": "#00000000",
        "peekViewEditorGutter.background": "#292c3c",
        "peekViewResult.background": "#292c3c",
        "peekViewResult.fileForeground": "#c6d0f5",
        "peekViewResult.lineForeground": "#c6d0f5",
        "peekViewResult.matchHighlightBackground": "#99d1db4d",
        "peekViewResult.selectionBackground": "#414559",
        "peekViewResult.selectionForeground": "#c6d0f5",
        "peekViewTitle.background": "#303446",
        "peekViewTitleDescription.foreground": "#b5bfe2b3",
        "peekViewTitleLabel.foreground": "#c6d0f5",
        "pickerGroup.border": "#ca9ee6",
        "pickerGroup.foreground": "#ca9ee6",
        "problemsErrorIcon.foreground": "#e78284",
        "problemsInfoIcon.foreground": "#8caaee",
        "problemsWarningIcon.foreground": "#ef9f76",
        "progressBar.background": "#ca9ee6",
        "pullRequests.closed": "#e78284",
        "pullRequests.draft": "#949cbb",
        "pullRequests.merged": "#ca9ee6",
        "pullRequests.notification": "#c6d0f5",
        "pullRequests.open": "#a6d189",
        "sash.hoverBorder": "#ca9ee6",
        "scmGraph.foreground1": "#e5c890",
        "scmGraph.foreground2": "#e78284",
        "scmGraph.foreground3": "#a6d189",
        "scmGraph.foreground4": "#ca9ee6",
        "scmGraph.foreground5": "#81c8be",
        "scmGraph.historyItemBaseRefColor": "#ef9f76",
        "scmGraph.historyItemRefColor": "#8caaee",
        "scmGraph.historyItemRemoteRefColor": "#ca9ee6",
        "scrollbar.shadow": "#232634",
        "scrollbarSlider.activeBackground": "#41455966",
        "scrollbarSlider.background": "#62688080",
        "scrollbarSlider.hoverBackground": "#737994",
        "selection.background": "#ca9ee666",
        "settings.dropdownBackground": "#51576d",
        "settings.dropdownListBorder": "#00000000",
        "settings.focusedRowBackground": "#62688033",
        "settings.headerForeground": "#c6d0f5",
        "settings.modifiedItemIndicator": "#ca9ee6",
        "settings.numberInputBackground": "#51576d",
        "settings.numberInputBorder": "#00000000",
        "settings.textInputBackground": "#51576d",
        "settings.textInputBorder": "#00000000",
        "sideBar.background": "#292c3c",
        "sideBar.border": "#00000000",
        "sideBar.dropBackground": "#ca9ee633",
        "sideBar.foreground": "#c6d0f5",
        "sideBarSectionHeader.background": "#292c3c",
        "sideBarSectionHeader.foreground": "#c6d0f5",
        "sideBarTitle.foreground": "#ca9ee6",
        "statusBar.background": "#232634",
        "statusBar.border": "#00000000",
        "statusBar.debuggingBackground": "#ef9f76",
        "statusBar.debuggingBorder": "#00000000",
        "statusBar.debuggingForeground": "#232634",
        "statusBar.foreground": "#c6d0f5",
        "statusBar.noFolderBackground": "#232634",
        "statusBar.noFolderBorder": "#00000000",
        "statusBar.noFolderForeground": "#c6d0f5",
        "statusBarItem.activeBackground": "#62688066",
        "statusBarItem.errorBackground": "#00000000",
        "statusBarItem.errorForeground": "#e78284",
        "statusBarItem.hoverBackground": "#62688033",
        "statusBarItem.prominentBackground": "#00000000",
        "statusBarItem.prominentForeground": "#ca9ee6",
        "statusBarItem.prominentHoverBackground": "#62688033",
        "statusBarItem.remoteBackground": "#8caaee",
        "statusBarItem.remoteForeground": "#232634",
        "statusBarItem.warningBackground": "#00000000",
        "statusBarItem.warningForeground": "#ef9f76",
        "symbolIcon.arrayForeground": "#ef9f76",
        "symbolIcon.booleanForeground": "#ca9ee6",
        "symbolIcon.classForeground": "#e5c890",
        "symbolIcon.colorForeground": "#f4b8e4",
        "symbolIcon.constantForeground": "#ef9f76",
        "symbolIcon.constructorForeground": "#babbf1",
        "symbolIcon.enumeratorForeground": "#e5c890",
        "symbolIcon.enumeratorMemberForeground": "#e5c890",
        "symbolIcon.eventForeground": "#f4b8e4",
        "symbolIcon.fieldForeground": "#c6d0f5",
        "symbolIcon.fileForeground": "#ca9ee6",
        "symbolIcon.folderForeground": "#ca9ee6",
        "symbolIcon.functionForeground": "#8caaee",
        "symbolIcon.interfaceForeground": "#e5c890",
        "symbolIcon.keyForeground": "#81c8be",
        "symbolIcon.keywordForeground": "#ca9ee6",
        "symbolIcon.methodForeground": "#8caaee",
        "symbolIcon.moduleForeground": "#c6d0f5",
        "symbolIcon.namespaceForeground": "#e5c890",
        "symbolIcon.nullForeground": "#ea999c",
        "symbolIcon.numberForeground": "#ef9f76",
        "symbolIcon.objectForeground": "#e5c890",
        "symbolIcon.operatorForeground": "#81c8be",
        "symbolIcon.packageForeground": "#eebebe",
        "symbolIcon.propertyForeground": "#ea999c",
        "symbolIcon.referenceForeground": "#e5c890",
        "symbolIcon.snippetForeground": "#eebebe",
        "symbolIcon.stringForeground": "#a6d189",
        "symbolIcon.structForeground": "#81c8be",
        "symbolIcon.textForeground": "#c6d0f5",
        "symbolIcon.typeParameterForeground": "#ea999c",
        "symbolIcon.unitForeground": "#c6d0f5",
        "symbolIcon.variableForeground": "#c6d0f5",
        "tab.activeBackground": "#303446",
        "tab.activeBorder": "#00000000",
        "tab.activeBorderTop": "#ca9ee6",
        "tab.activeForeground": "#ca9ee6",
        "tab.activeModifiedBorder": "#e5c890",
        "tab.border": "#292c3c",
        "tab.hoverBackground": "#3a3f55",
        "tab.hoverBorder": "#00000000",
        "tab.hoverForeground": "#ca9ee6",
        "tab.inactiveBackground": "#292c3c",
        "tab.inactiveForeground": "#737994",
        "tab.inactiveModifiedBorder": "#e5c8904d",
        "tab.lastPinnedBorder": "#ca9ee6",
        "tab.unfocusedActiveBackground": "#292c3c",
        "tab.unfocusedActiveBorder": "#00000000",
        "tab.unfocusedActiveBorderTop": "#ca9ee64d",
        "tab.unfocusedInactiveBackground": "#1f212d",
        "table.headerBackground": "#414559",
        "table.headerForeground": "#c6d0f5",
        "terminal.ansiBlack": "#51576d",
        "terminal.ansiBlue": "#8caaee",
        "terminal.ansiBrightBlack": "#626880",
        "terminal.ansiBrightBlue": "#7b9ef0",
        "terminal.ansiBrightCyan": "#5abfb5",
        "terminal.ansiBrightGreen": "#8ec772",
        "terminal.ansiBrightMagenta": "#f2a4db",
        "terminal.ansiBrightRed": "#e67172",
        "terminal.ansiBrightWhite": "#b5bfe2",
        "terminal.ansiBrightYellow": "#d9ba73",
        "terminal.ansiCyan": "#81c8be",
        "terminal.ansiGreen": "#a6d189",
        "terminal.ansiMagenta": "#f4b8e4",
        "terminal.ansiRed": "#e78284",
        "terminal.ansiWhite": "#a5adce",
        "terminal.ansiYellow": "#e5c890",
        "terminal.border": "#626880",
        "terminal.dropBackground": "#ca9ee633",
        "terminal.foreground": "#c6d0f5",
        "terminal.inactiveSelectionBackground": "#62688080",
        "terminal.selectionBackground": "#626880",
        "terminal.tab.activeBorder": "#ca9ee6",
        "terminalCommandDecoration.defaultBackground": "#626880",
        "terminalCommandDecoration.errorBackground": "#e78284",
        "terminalCommandDecoration.successBackground": "#a6d189",
        "terminalCursor.background": "#303446",
        "terminalCursor.foreground": "#f2d5cf",
        "testing.coverCountBadgeBackground": "#00000000",
        "testing.coverCountBadgeForeground": "#ca9ee6",
        "testing.coveredBackground": "#a6d1894d",
        "testing.coveredBorder": "#00000000",
        "testing.coveredGutterBackground": "#a6d1894d",
        "testing.iconErrored": "#e78284",
        "testing.iconErrored.retired": "#e78284",
        "testing.iconFailed": "#e78284",
        "testing.iconFailed.retired": "#e78284",
        "testing.iconPassed": "#a6d189",
        "testing.iconPassed.retired": "#a6d189",
        "testing.iconQueued": "#8caaee",
        "testing.iconQueued.retired": "#8caaee",
        "testing.iconSkipped": "#a5adce",
        "testing.iconSkipped.retired": "#a5adce",
        "testing.iconUnset": "#c6d0f5",
        "testing.iconUnset.retired": "#c6d0f5",
        "testing.message.error.lineBackground": "#e7828426",
        "testing.message.info.decorationForeground": "#a6d189cc",
        "testing.message.info.lineBackground": "#a6d18926",
        "testing.messagePeekBorder": "#ca9ee6",
        "testing.messagePeekHeaderBackground": "#626880",
        "testing.peekBorder": "#ca9ee6",
        "testing.peekHeaderBackground": "#626880",
        "testing.runAction": "#ca9ee6",
        "testing.uncoveredBackground": "#e7828433",
        "testing.uncoveredBorder": "#00000000",
        "testing.uncoveredBranchBackground": "#e7828433",
        "testing.uncoveredGutterBackground": "#e7828440",
        "textBlockQuote.background": "#292c3c",
        "textBlockQuote.border": "#232634",
        "textCodeBlock.background": "#292c3c",
        "textLink.activeForeground": "#99d1db",
        "textLink.foreground": "#8caaee",
        "textPreformat.foreground": "#c6d0f5",
        "textSeparator.foreground": "#ca9ee6",
        "titleBar.activeBackground": "#232634",
        "titleBar.activeForeground": "#c6d0f5",
        "titleBar.border": "#00000000",
        "titleBar.inactiveBackground": "#232634",
        "titleBar.inactiveForeground": "#c6d0f580",
        "tree.inactiveIndentGuidesStroke": "#51576d",
        "tree.indentGuidesStroke": "#949cbb",
        "walkThrough.embeddedEditorBackground": "#3034464d",
        "welcomePage.progress.background": "#232634",
        "welcomePage.progress.foreground": "#ca9ee6",
        "welcomePage.tileBackground": "#292c3c",
        "widget.shadow": "#292c3c80",
        "window.activeBorder": "#00000000",
        "window.inactiveBorder": "#00000000"
      },
      "displayName": "Catppuccin Frappé",
      "name": "catppuccin-frappe",
      "semanticHighlighting": true,
      "semanticTokenColors": {
        "boolean": {
          "foreground": "#ef9f76"
        },
        "builtinAttribute.attribute.library:rust": {
          "foreground": "#8caaee"
        },
        "class.builtin:python": {
          "foreground": "#ca9ee6"
        },
        "class:python": {
          "foreground": "#e5c890"
        },
        "constant.builtin.readonly:nix": {
          "foreground": "#ca9ee6"
        },
        "enumMember": {
          "foreground": "#81c8be"
        },
        "function.decorator:python": {
          "foreground": "#ef9f76"
        },
        "generic.attribute:rust": {
          "foreground": "#c6d0f5"
        },
        "heading": {
          "foreground": "#e78284"
        },
        "number": {
          "foreground": "#ef9f76"
        },
        "pol": {
          "foreground": "#eebebe"
        },
        "property.readonly:javascript": {
          "foreground": "#c6d0f5"
        },
        "property.readonly:javascriptreact": {
          "foreground": "#c6d0f5"
        },
        "property.readonly:typescript": {
          "foreground": "#c6d0f5"
        },
        "property.readonly:typescriptreact": {
          "foreground": "#c6d0f5"
        },
        "selfKeyword": {
          "foreground": "#e78284"
        },
        "text.emph": {
          "fontStyle": "italic",
          "foreground": "#e78284"
        },
        "text.math": {
          "foreground": "#eebebe"
        },
        "text.strong": {
          "fontStyle": "bold",
          "foreground": "#e78284"
        },
        "tomlArrayKey": {
          "fontStyle": "",
          "foreground": "#8caaee"
        },
        "tomlTableKey": {
          "fontStyle": "",
          "foreground": "#8caaee"
        },
        "type.defaultLibrary:go": {
          "foreground": "#ca9ee6"
        },
        "variable.defaultLibrary": {
          "foreground": "#ea999c"
        },
        "variable.readonly.defaultLibrary:go": {
          "foreground": "#ca9ee6"
        },
        "variable.readonly:javascript": {
          "foreground": "#c6d0f5"
        },
        "variable.readonly:javascriptreact": {
          "foreground": "#c6d0f5"
        },
        "variable.readonly:scala": {
          "foreground": "#c6d0f5"
        },
        "variable.readonly:typescript": {
          "foreground": "#c6d0f5"
        },
        "variable.readonly:typescriptreact": {
          "foreground": "#c6d0f5"
        },
        "variable.typeHint:python": {
          "foreground": "#e5c890"
        }
      },
      "tokenColors": [
        {
          "scope": [
            "text",
            "source",
            "variable.other.readwrite",
            "punctuation.definition.variable"
          ],
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": "punctuation",
          "settings": {
            "fontStyle": "",
            "foreground": "#949cbb"
          }
        },
        {
          "scope": [
            "comment",
            "punctuation.definition.comment"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#949cbb"
          }
        },
        {
          "scope": [
            "string",
            "punctuation.definition.string"
          ],
          "settings": {
            "foreground": "#a6d189"
          }
        },
        {
          "scope": "constant.character.escape",
          "settings": {
            "foreground": "#f4b8e4"
          }
        },
        {
          "scope": [
            "constant.numeric",
            "variable.other.constant",
            "entity.name.constant",
            "constant.language.boolean",
            "constant.language.false",
            "constant.language.true",
            "keyword.other.unit.user-defined",
            "keyword.other.unit.suffix.floating-point"
          ],
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": [
            "keyword",
            "keyword.operator.word",
            "keyword.operator.new",
            "variable.language.super",
            "support.type.primitive",
            "storage.type",
            "storage.modifier",
            "punctuation.definition.keyword"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": "entity.name.tag.documentation",
          "settings": {
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": [
            "keyword.operator",
            "punctuation.accessor",
            "punctuation.definition.generic",
            "meta.function.closure punctuation.section.parameters",
            "punctuation.definition.tag",
            "punctuation.separator.key-value"
          ],
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": [
            "entity.name.function",
            "meta.function-call.method",
            "support.function",
            "support.function.misc",
            "variable.function"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#8caaee"
          }
        },
        {
          "scope": [
            "entity.name.class",
            "entity.other.inherited-class",
            "support.class",
            "meta.function-call.constructor",
            "entity.name.struct"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#e5c890"
          }
        },
        {
          "scope": "entity.name.enum",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#e5c890"
          }
        },
        {
          "scope": [
            "meta.enum variable.other.readwrite",
            "variable.other.enummember"
          ],
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": "meta.property.object",
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": [
            "meta.type",
            "meta.type-alias",
            "support.type",
            "entity.name.type"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#e5c890"
          }
        },
        {
          "scope": [
            "meta.annotation variable.function",
            "meta.annotation variable.annotation.function",
            "meta.annotation punctuation.definition.annotation",
            "meta.decorator",
            "punctuation.decorator"
          ],
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": [
            "variable.parameter",
            "meta.function.parameters"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#ea999c"
          }
        },
        {
          "scope": [
            "constant.language",
            "support.function.builtin"
          ],
          "settings": {
            "foreground": "#e78284"
          }
        },
        {
          "scope": "entity.other.attribute-name.documentation",
          "settings": {
            "foreground": "#e78284"
          }
        },
        {
          "scope": [
            "keyword.control.directive",
            "punctuation.definition.directive"
          ],
          "settings": {
            "foreground": "#e5c890"
          }
        },
        {
          "scope": "punctuation.definition.typeparameters",
          "settings": {
            "foreground": "#99d1db"
          }
        },
        {
          "scope": "entity.name.namespace",
          "settings": {
            "foreground": "#e5c890"
          }
        },
        {
          "scope": [
            "support.type.property-name.css",
            "support.type.property-name.less"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#8caaee"
          }
        },
        {
          "scope": [
            "variable.language.this",
            "variable.language.this punctuation.definition.variable"
          ],
          "settings": {
            "foreground": "#e78284"
          }
        },
        {
          "scope": "variable.object.property",
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": [
            "string.template variable",
            "string variable"
          ],
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": "keyword.operator.new",
          "settings": {
            "fontStyle": "bold"
          }
        },
        {
          "scope": "storage.modifier.specifier.extern.cpp",
          "settings": {
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": [
            "entity.name.scope-resolution.template.call.cpp",
            "entity.name.scope-resolution.parameter.cpp",
            "entity.name.scope-resolution.cpp",
            "entity.name.scope-resolution.function.definition.cpp"
          ],
          "settings": {
            "foreground": "#e5c890"
          }
        },
        {
          "scope": "storage.type.class.doxygen",
          "settings": {
            "fontStyle": ""
          }
        },
        {
          "scope": [
            "storage.modifier.reference.cpp"
          ],
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": "meta.interpolation.cs",
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": "comment.block.documentation.cs",
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": [
            "source.css entity.other.attribute-name.class.css",
            "entity.other.attribute-name.parent-selector.css punctuation.definition.entity.css"
          ],
          "settings": {
            "foreground": "#e5c890"
          }
        },
        {
          "scope": "punctuation.separator.operator.css",
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": "source.css entity.other.attribute-name.pseudo-class",
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": "source.css constant.other.unicode-range",
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": "source.css variable.parameter.url",
          "settings": {
            "fontStyle": "",
            "foreground": "#a6d189"
          }
        },
        {
          "scope": [
            "support.type.vendored.property-name"
          ],
          "settings": {
            "foreground": "#99d1db"
          }
        },
        {
          "scope": [
            "source.css meta.property-value variable",
            "source.css meta.property-value variable.other.less",
            "source.css meta.property-value variable.other.less punctuation.definition.variable.less",
            "meta.definition.variable.scss"
          ],
          "settings": {
            "foreground": "#ea999c"
          }
        },
        {
          "scope": [
            "source.css meta.property-list variable",
            "meta.property-list variable.other.less",
            "meta.property-list variable.other.less punctuation.definition.variable.less"
          ],
          "settings": {
            "foreground": "#8caaee"
          }
        },
        {
          "scope": "keyword.other.unit.percentage.css",
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": "source.css meta.attribute-selector",
          "settings": {
            "foreground": "#a6d189"
          }
        },
        {
          "scope": [
            "keyword.other.definition.ini",
            "punctuation.support.type.property-name.json",
            "support.type.property-name.json",
            "punctuation.support.type.property-name.toml",
            "support.type.property-name.toml",
            "entity.name.tag.yaml",
            "punctuation.support.type.property-name.yaml",
            "support.type.property-name.yaml"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#8caaee"
          }
        },
        {
          "scope": [
            "constant.language.json",
            "constant.language.yaml"
          ],
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": [
            "entity.name.type.anchor.yaml",
            "variable.other.alias.yaml"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#e5c890"
          }
        },
        {
          "scope": [
            "support.type.property-name.table",
            "entity.name.section.group-title.ini"
          ],
          "settings": {
            "foreground": "#e5c890"
          }
        },
        {
          "scope": "constant.other.time.datetime.offset.toml",
          "settings": {
            "foreground": "#f4b8e4"
          }
        },
        {
          "scope": [
            "punctuation.definition.anchor.yaml",
            "punctuation.definition.alias.yaml"
          ],
          "settings": {
            "foreground": "#f4b8e4"
          }
        },
        {
          "scope": "entity.other.document.begin.yaml",
          "settings": {
            "foreground": "#f4b8e4"
          }
        },
        {
          "scope": "markup.changed.diff",
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": [
            "meta.diff.header.from-file",
            "meta.diff.header.to-file",
            "punctuation.definition.from-file.diff",
            "punctuation.definition.to-file.diff"
          ],
          "settings": {
            "foreground": "#8caaee"
          }
        },
        {
          "scope": "markup.inserted.diff",
          "settings": {
            "foreground": "#a6d189"
          }
        },
        {
          "scope": "markup.deleted.diff",
          "settings": {
            "foreground": "#e78284"
          }
        },
        {
          "scope": [
            "variable.other.env"
          ],
          "settings": {
            "foreground": "#8caaee"
          }
        },
        {
          "scope": [
            "string.quoted variable.other.env"
          ],
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": "support.function.builtin.gdscript",
          "settings": {
            "foreground": "#8caaee"
          }
        },
        {
          "scope": "constant.language.gdscript",
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": "comment meta.annotation.go",
          "settings": {
            "foreground": "#ea999c"
          }
        },
        {
          "scope": "comment meta.annotation.parameters.go",
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": "constant.language.go",
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": "variable.graphql",
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": "string.unquoted.alias.graphql",
          "settings": {
            "foreground": "#eebebe"
          }
        },
        {
          "scope": "constant.character.enum.graphql",
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": "meta.objectvalues.graphql constant.object.key.graphql string.unquoted.graphql",
          "settings": {
            "foreground": "#eebebe"
          }
        },
        {
          "scope": [
            "keyword.other.doctype",
            "meta.tag.sgml.doctype punctuation.definition.tag",
            "meta.tag.metadata.doctype entity.name.tag",
            "meta.tag.metadata.doctype punctuation.definition.tag"
          ],
          "settings": {
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": [
            "entity.name.tag"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#8caaee"
          }
        },
        {
          "scope": [
            "text.html constant.character.entity",
            "text.html constant.character.entity punctuation",
            "constant.character.entity.xml",
            "constant.character.entity.xml punctuation",
            "constant.character.entity.js.jsx",
            "constant.charactger.entity.js.jsx punctuation",
            "constant.character.entity.tsx",
            "constant.character.entity.tsx punctuation"
          ],
          "settings": {
            "foreground": "#e78284"
          }
        },
        {
          "scope": [
            "entity.other.attribute-name"
          ],
          "settings": {
            "foreground": "#e5c890"
          }
        },
        {
          "scope": [
            "support.class.component",
            "support.class.component.jsx",
            "support.class.component.tsx",
            "support.class.component.vue"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#f4b8e4"
          }
        },
        {
          "scope": [
            "punctuation.definition.annotation",
            "storage.type.annotation"
          ],
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": "constant.other.enum.java",
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": "storage.modifier.import.java",
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": "comment.block.javadoc.java keyword.other.documentation.javadoc.java",
          "settings": {
            "fontStyle": ""
          }
        },
        {
          "scope": "meta.export variable.other.readwrite.js",
          "settings": {
            "foreground": "#ea999c"
          }
        },
        {
          "scope": [
            "variable.other.constant.js",
            "variable.other.constant.ts",
            "variable.other.property.js",
            "variable.other.property.ts"
          ],
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": [
            "variable.other.jsdoc",
            "comment.block.documentation variable.other"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#ea999c"
          }
        },
        {
          "scope": "storage.type.class.jsdoc",
          "settings": {
            "fontStyle": ""
          }
        },
        {
          "scope": "support.type.object.console.js",
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": [
            "support.constant.node",
            "support.type.object.module.js"
          ],
          "settings": {
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": "storage.modifier.implements",
          "settings": {
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": [
            "constant.language.null.js",
            "constant.language.null.ts",
            "constant.language.undefined.js",
            "constant.language.undefined.ts",
            "support.type.builtin.ts"
          ],
          "settings": {
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": "variable.parameter.generic",
          "settings": {
            "foreground": "#e5c890"
          }
        },
        {
          "scope": [
            "keyword.declaration.function.arrow.js",
            "storage.type.function.arrow.ts"
          ],
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": "punctuation.decorator.ts",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#8caaee"
          }
        },
        {
          "scope": [
            "keyword.operator.expression.in.js",
            "keyword.operator.expression.in.ts",
            "keyword.operator.expression.infer.ts",
            "keyword.operator.expression.instanceof.js",
            "keyword.operator.expression.instanceof.ts",
            "keyword.operator.expression.is",
            "keyword.operator.expression.keyof.ts",
            "keyword.operator.expression.of.js",
            "keyword.operator.expression.of.ts",
            "keyword.operator.expression.typeof.ts"
          ],
          "settings": {
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": "support.function.macro.julia",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#81c8be"
          }
        },
        {
          "scope": "constant.language.julia",
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": "constant.other.symbol.julia",
          "settings": {
            "foreground": "#ea999c"
          }
        },
        {
          "scope": "text.tex keyword.control.preamble",
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": "text.tex support.function.be",
          "settings": {
            "foreground": "#99d1db"
          }
        },
        {
          "scope": "constant.other.general.math.tex",
          "settings": {
            "foreground": "#eebebe"
          }
        },
        {
          "scope": "variable.language.liquid",
          "settings": {
            "foreground": "#f4b8e4"
          }
        },
        {
          "scope": "comment.line.double-dash.documentation.lua storage.type.annotation.lua",
          "settings": {
            "fontStyle": "",
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": [
            "comment.line.double-dash.documentation.lua entity.name.variable.lua",
            "comment.line.double-dash.documentation.lua variable.lua"
          ],
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": [
            "heading.1.markdown punctuation.definition.heading.markdown",
            "heading.1.markdown",
            "heading.1.quarto punctuation.definition.heading.quarto",
            "heading.1.quarto",
            "markup.heading.atx.1.mdx",
            "markup.heading.atx.1.mdx punctuation.definition.heading.mdx",
            "markup.heading.setext.1.markdown",
            "markup.heading.heading-0.asciidoc"
          ],
          "settings": {
            "foreground": "#e78284"
          }
        },
        {
          "scope": [
            "heading.2.markdown punctuation.definition.heading.markdown",
            "heading.2.markdown",
            "heading.2.quarto punctuation.definition.heading.quarto",
            "heading.2.quarto",
            "markup.heading.atx.2.mdx",
            "markup.heading.atx.2.mdx punctuation.definition.heading.mdx",
            "markup.heading.setext.2.markdown",
            "markup.heading.heading-1.asciidoc"
          ],
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": [
            "heading.3.markdown punctuation.definition.heading.markdown",
            "heading.3.markdown",
            "heading.3.quarto punctuation.definition.heading.quarto",
            "heading.3.quarto",
            "markup.heading.atx.3.mdx",
            "markup.heading.atx.3.mdx punctuation.definition.heading.mdx",
            "markup.heading.heading-2.asciidoc"
          ],
          "settings": {
            "foreground": "#e5c890"
          }
        },
        {
          "scope": [
            "heading.4.markdown punctuation.definition.heading.markdown",
            "heading.4.markdown",
            "heading.4.quarto punctuation.definition.heading.quarto",
            "heading.4.quarto",
            "markup.heading.atx.4.mdx",
            "markup.heading.atx.4.mdx punctuation.definition.heading.mdx",
            "markup.heading.heading-3.asciidoc"
          ],
          "settings": {
            "foreground": "#a6d189"
          }
        },
        {
          "scope": [
            "heading.5.markdown punctuation.definition.heading.markdown",
            "heading.5.markdown",
            "heading.5.quarto punctuation.definition.heading.quarto",
            "heading.5.quarto",
            "markup.heading.atx.5.mdx",
            "markup.heading.atx.5.mdx punctuation.definition.heading.mdx",
            "markup.heading.heading-4.asciidoc"
          ],
          "settings": {
            "foreground": "#85c1dc"
          }
        },
        {
          "scope": [
            "heading.6.markdown punctuation.definition.heading.markdown",
            "heading.6.markdown",
            "heading.6.quarto punctuation.definition.heading.quarto",
            "heading.6.quarto",
            "markup.heading.atx.6.mdx",
            "markup.heading.atx.6.mdx punctuation.definition.heading.mdx",
            "markup.heading.heading-5.asciidoc"
          ],
          "settings": {
            "foreground": "#babbf1"
          }
        },
        {
          "scope": "markup.bold",
          "settings": {
            "fontStyle": "bold",
            "foreground": "#e78284"
          }
        },
        {
          "scope": "markup.italic",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#e78284"
          }
        },
        {
          "scope": "markup.strikethrough",
          "settings": {
            "fontStyle": "strikethrough",
            "foreground": "#a5adce"
          }
        },
        {
          "scope": [
            "punctuation.definition.link",
            "markup.underline.link"
          ],
          "settings": {
            "foreground": "#8caaee"
          }
        },
        {
          "scope": [
            "text.html.markdown punctuation.definition.link.title",
            "text.html.quarto punctuation.definition.link.title",
            "string.other.link.title.markdown",
            "string.other.link.title.quarto",
            "markup.link",
            "punctuation.definition.constant.markdown",
            "punctuation.definition.constant.quarto",
            "constant.other.reference.link.markdown",
            "constant.other.reference.link.quarto",
            "markup.substitution.attribute-reference"
          ],
          "settings": {
            "foreground": "#babbf1"
          }
        },
        {
          "scope": [
            "punctuation.definition.raw.markdown",
            "punctuation.definition.raw.quarto",
            "markup.inline.raw.string.markdown",
            "markup.inline.raw.string.quarto",
            "markup.raw.block.markdown",
            "markup.raw.block.quarto"
          ],
          "settings": {
            "foreground": "#a6d189"
          }
        },
        {
          "scope": "fenced_code.block.language",
          "settings": {
            "foreground": "#99d1db"
          }
        },
        {
          "scope": [
            "markup.fenced_code.block punctuation.definition",
            "markup.raw support.asciidoc"
          ],
          "settings": {
            "foreground": "#949cbb"
          }
        },
        {
          "scope": [
            "markup.quote",
            "punctuation.definition.quote.begin"
          ],
          "settings": {
            "foreground": "#f4b8e4"
          }
        },
        {
          "scope": "meta.separator.markdown",
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": [
            "punctuation.definition.list.begin.markdown",
            "punctuation.definition.list.begin.quarto",
            "markup.list.bullet"
          ],
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": "markup.heading.quarto",
          "settings": {
            "fontStyle": "bold"
          }
        },
        {
          "scope": [
            "entity.other.attribute-name.multipart.nix",
            "entity.other.attribute-name.single.nix"
          ],
          "settings": {
            "foreground": "#8caaee"
          }
        },
        {
          "scope": "variable.parameter.name.nix",
          "settings": {
            "fontStyle": "",
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": "meta.embedded variable.parameter.name.nix",
          "settings": {
            "fontStyle": "",
            "foreground": "#babbf1"
          }
        },
        {
          "scope": "string.unquoted.path.nix",
          "settings": {
            "fontStyle": "",
            "foreground": "#f4b8e4"
          }
        },
        {
          "scope": [
            "support.attribute.builtin",
            "meta.attribute.php"
          ],
          "settings": {
            "foreground": "#e5c890"
          }
        },
        {
          "scope": "meta.function.parameters.php punctuation.definition.variable.php",
          "settings": {
            "foreground": "#ea999c"
          }
        },
        {
          "scope": "constant.language.php",
          "settings": {
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": "text.html.php support.function",
          "settings": {
            "foreground": "#99d1db"
          }
        },
        {
          "scope": "keyword.other.phpdoc.php",
          "settings": {
            "fontStyle": ""
          }
        },
        {
          "scope": [
            "support.variable.magic.python",
            "meta.function-call.arguments.python"
          ],
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": [
            "support.function.magic.python"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#99d1db"
          }
        },
        {
          "scope": [
            "variable.parameter.function.language.special.self.python",
            "variable.language.special.self.python"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#e78284"
          }
        },
        {
          "scope": [
            "keyword.control.flow.python",
            "keyword.operator.logical.python"
          ],
          "settings": {
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": "storage.type.function.python",
          "settings": {
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": [
            "support.token.decorator.python",
            "meta.function.decorator.identifier.python"
          ],
          "settings": {
            "foreground": "#99d1db"
          }
        },
        {
          "scope": [
            "meta.function-call.python"
          ],
          "settings": {
            "foreground": "#8caaee"
          }
        },
        {
          "scope": [
            "entity.name.function.decorator.python",
            "punctuation.definition.decorator.python"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": "constant.character.format.placeholder.other.python",
          "settings": {
            "foreground": "#f4b8e4"
          }
        },
        {
          "scope": [
            "support.type.exception.python",
            "support.function.builtin.python"
          ],
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": [
            "support.type.python"
          ],
          "settings": {
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": "constant.language.python",
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": [
            "meta.indexed-name.python",
            "meta.item-access.python"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#ea999c"
          }
        },
        {
          "scope": "storage.type.string.python",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#a6d189"
          }
        },
        {
          "scope": "meta.function.parameters.python",
          "settings": {
            "fontStyle": ""
          }
        },
        {
          "scope": "meta.function-call.r",
          "settings": {
            "foreground": "#8caaee"
          }
        },
        {
          "scope": "meta.function-call.arguments.r",
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": [
            "string.regexp punctuation.definition.string.begin",
            "string.regexp punctuation.definition.string.end"
          ],
          "settings": {
            "foreground": "#f4b8e4"
          }
        },
        {
          "scope": "keyword.control.anchor.regexp",
          "settings": {
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": "string.regexp.ts",
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": [
            "punctuation.definition.group.regexp",
            "keyword.other.back-reference.regexp"
          ],
          "settings": {
            "foreground": "#a6d189"
          }
        },
        {
          "scope": "punctuation.definition.character-class.regexp",
          "settings": {
            "foreground": "#e5c890"
          }
        },
        {
          "scope": "constant.other.character-class.regexp",
          "settings": {
            "foreground": "#f4b8e4"
          }
        },
        {
          "scope": "constant.other.character-class.range.regexp",
          "settings": {
            "foreground": "#f2d5cf"
          }
        },
        {
          "scope": "keyword.operator.quantifier.regexp",
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": "constant.character.numeric.regexp",
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": [
            "punctuation.definition.group.no-capture.regexp",
            "meta.assertion.look-ahead.regexp",
            "meta.assertion.negative-look-ahead.regexp"
          ],
          "settings": {
            "foreground": "#8caaee"
          }
        },
        {
          "scope": [
            "meta.annotation.rust",
            "meta.annotation.rust punctuation",
            "meta.attribute.rust",
            "punctuation.definition.attribute.rust"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#e5c890"
          }
        },
        {
          "scope": [
            "meta.attribute.rust string.quoted.double.rust",
            "meta.attribute.rust string.quoted.single.char.rust"
          ],
          "settings": {
            "fontStyle": ""
          }
        },
        {
          "scope": [
            "entity.name.function.macro.rules.rust",
            "storage.type.module.rust",
            "storage.modifier.rust",
            "storage.type.struct.rust",
            "storage.type.enum.rust",
            "storage.type.trait.rust",
            "storage.type.union.rust",
            "storage.type.impl.rust",
            "storage.type.rust",
            "storage.type.function.rust",
            "storage.type.type.rust"
          ],
          "settings": {
            "fontStyle": "",
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": "entity.name.type.numeric.rust",
          "settings": {
            "fontStyle": "",
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": "meta.generic.rust",
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": "entity.name.impl.rust",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#e5c890"
          }
        },
        {
          "scope": "entity.name.module.rust",
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": "entity.name.trait.rust",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#e5c890"
          }
        },
        {
          "scope": "storage.type.source.rust",
          "settings": {
            "foreground": "#e5c890"
          }
        },
        {
          "scope": "entity.name.union.rust",
          "settings": {
            "foreground": "#e5c890"
          }
        },
        {
          "scope": "meta.enum.rust storage.type.source.rust",
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": [
            "support.macro.rust",
            "meta.macro.rust support.function.rust",
            "entity.name.function.macro.rust"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#8caaee"
          }
        },
        {
          "scope": [
            "storage.modifier.lifetime.rust",
            "entity.name.type.lifetime"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#8caaee"
          }
        },
        {
          "scope": "string.quoted.double.rust constant.other.placeholder.rust",
          "settings": {
            "foreground": "#f4b8e4"
          }
        },
        {
          "scope": "meta.function.return-type.rust meta.generic.rust storage.type.rust",
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": "meta.function.call.rust",
          "settings": {
            "foreground": "#8caaee"
          }
        },
        {
          "scope": "punctuation.brackets.angle.rust",
          "settings": {
            "foreground": "#99d1db"
          }
        },
        {
          "scope": "constant.other.caps.rust",
          "settings": {
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": [
            "meta.function.definition.rust variable.other.rust"
          ],
          "settings": {
            "foreground": "#ea999c"
          }
        },
        {
          "scope": "meta.function.call.rust variable.other.rust",
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": "variable.language.self.rust",
          "settings": {
            "foreground": "#e78284"
          }
        },
        {
          "scope": [
            "variable.other.metavariable.name.rust",
            "meta.macro.metavariable.rust keyword.operator.macro.dollar.rust"
          ],
          "settings": {
            "foreground": "#f4b8e4"
          }
        },
        {
          "scope": [
            "comment.line.shebang",
            "comment.line.shebang punctuation.definition.comment",
            "comment.line.shebang",
            "punctuation.definition.comment.shebang.shell",
            "meta.shebang.shell"
          ],
          "settings": {
            "fontStyle": "italic",
            "foreground": "#f4b8e4"
          }
        },
        {
          "scope": "comment.line.shebang constant.language",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#81c8be"
          }
        },
        {
          "scope": [
            "meta.function-call.arguments.shell punctuation.definition.variable.shell",
            "meta.function-call.arguments.shell punctuation.section.interpolation",
            "meta.function-call.arguments.shell punctuation.definition.variable.shell",
            "meta.function-call.arguments.shell punctuation.section.interpolation"
          ],
          "settings": {
            "foreground": "#e78284"
          }
        },
        {
          "scope": "meta.string meta.interpolation.parameter.shell variable.other.readwrite",
          "settings": {
            "fontStyle": "italic",
            "foreground": "#ef9f76"
          }
        },
        {
          "scope": [
            "source.shell punctuation.section.interpolation",
            "punctuation.definition.evaluation.backticks.shell"
          ],
          "settings": {
            "foreground": "#81c8be"
          }
        },
        {
          "scope": "entity.name.tag.heredoc.shell",
          "settings": {
            "foreground": "#ca9ee6"
          }
        },
        {
          "scope": "string.quoted.double.shell variable.other.normal.shell",
          "settings": {
            "foreground": "#c6d0f5"
          }
        },
        {
          "scope": [
            "markup.heading.typst"
          ],
          "settings": {
            "foreground": "#e78284"
          }
        }
      ],
      "type": "dark"
    }
  }
}