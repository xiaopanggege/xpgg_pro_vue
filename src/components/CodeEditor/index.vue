<template>
  <div class="code-editor">
    <textarea ref="textarea" />
  </div>
</template>

<script>
// 必配项
import CodeMirror from 'codemirror'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
// 加载主题
import 'codemirror/theme/monokai.css'
// 加载语法
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/python/python'
import 'codemirror/mode/yaml/yaml'
import 'codemirror/mode/shell/shell'
// 语法提示
import 'codemirror/addon/hint/show-hint'

// 缩进折叠
import "codemirror/addon/fold/foldcode"
import "codemirror/addon/fold/foldgutter"
import "codemirror/addon/fold/brace-fold"
import "codemirror/addon/fold/indent-fold"
import "codemirror/addon/fold/comment-fold"
// 高亮光标选择行
import "codemirror/addon/selection/active-line"
// 自动闭合符号
import "codemirror/addon/edit/closebrackets"
import "codemirror/addon/edit/matchbrackets"

import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'
import 'codemirror/addon/lint/yaml-lint'
// 按键风格
import 'codemirror/keymap/sublime'

export default {
  name: 'CodeEditor',
  /* eslint-disable vue/require-prop-types */
  props: {
    value: {
      type: String,
    },
    mode:{
      type: String,
      default: 'text'
    }
  },
  data() {
    return {
      codeEditor: false
    }
  },
  watch: {
    value(value) {
      const editorValue = this.codeEditor.getValue()
      if (value !== editorValue) {
        this.codeEditor.setValue(this.value)
      }
    },
    mode: function (val, oldVal) {
      if(val != oldVal){
        if(val !='python'){
          this.codeEditor.setOption('mode', val)
          this.codeEditor.setOption('indentUnit', 2)
        }else{
          this.codeEditor.setOption('mode', {name: "python", singleLineStringErrors: true})
          this.codeEditor.setOption('indentUnit', 4)
        }
      }
    },
  },
  mounted() {
    this.codeEditor = CodeMirror.fromTextArea(this.$refs.textarea, {
      lineNumbers: true,
      // mode: 'text/x-yaml',
      // mode: 'text/x-python',
      mode: 'text',
      // mode:  {name: "python", singleLineStringErrors: true},
      // 在行槽中添加行号显示器、折叠器、语法检测器
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-lint-markers"],
      theme: 'monokai',
      keyMap: "sublime", // 快键键风格
      readOnly: false, // 只读与否
      styleActiveLine: true, // 当前行背景高亮
      matchBrackets: true, // 匹配结束符号，比如"]、}"
      // tabSize: 4,//tab大小
      autoCloseBrackets: true, // 自动闭合符号
      lineWrapping: false, //在长行时文字是换行(wrap)还是滚动(scroll)，默认为false滚动(scroll)
      // lint: true, // 代码检查，奶奶的没用，只有json可以还必须按照对应的jsonlint
      indentUnit: 4, // 智能缩进单位为4个空格长度
      foldGutter: true, // 启用行槽中的代码折叠
      autofocus: true, // 自动聚焦
    })

    this.codeEditor.setValue(this.value)
    this.codeEditor.on('change', cm => {
      this.$emit('changed', cm.getValue())
      this.$emit('input', cm.getValue())
    })
    
  },
  methods: {
    getValue() {
      return this.codeEditor.getValue()
    },
  }
}
</script>

<style scoped>
.code-editor{
  height: 100%;
  /* position: relative; */
  /* border: 1px solid rgb(204, 204, 204);
  border-radius: 4px; */
}
.code-editor >>> .CodeMirror {
  height: 100%;
  /* min-height: 300px; */
}
.code-editor >>> .CodeMirror-scroll{
  /* min-height: 300px; */
}
.code-editor >>> .cm-s-monokai span.cm-string {
  /* color: #F08047; */
}
.code-editor >>> .cm-s-monokai span {
  /* color: none; */
}
</style>
