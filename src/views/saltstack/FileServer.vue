<template>
  <div class="app-container">
    <el-row :gutter="20">
        <el-col :span="6"  style="border: 1px solid #ccc;border-radius: 4px;" v-loading="listLoading" :element-loading-text="listLoadingText"
                element-loading-spinner="el-icon-loading">
          <el-row style="margin:3px 0;">
            <el-button type="primary" size="mini" :disabled="uploadStatus"  @click="handUploadDialog">上传</el-button>
            <el-button type="primary" size="mini" :disabled="createStatus" @click="handCreateDialog">创建</el-button>
            <el-button type="primary" size="mini" :disabled="renameStatus" @click="handRenameDialog">重命名</el-button>
            <el-button type="primary" size="mini" :disabled="openStatus" @click="handOpenFile" :loading="fileLoading">打开</el-button>
            <el-button type="danger" size="mini"  :disabled="deleteStatus" @click="handDeleteDialog">删除</el-button>
          </el-row>
          <div>
            <el-tree class="overflow_set" :data="file_tree" :props="defaultProps" @node-click="handleNodeClick" 
            empty-text="" highlight-current>
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span @click="clickNode=node">
                  <span v-if="data.type=='d'"><svg-icon icon-class="floder" class-name="card-node-icon" /></span>
                  <span v-else><svg-icon icon-class="file" class-name="card-node-icon" /></span>
                    {{ node.label }}
                </span> 
              </span>
            </el-tree>
          </div>
        </el-col>
        <el-col :span="12">
              <div class="editor-div">
                <el-row style="margin:3px 0;" >
                  <el-input v-model="open_file_path" readonly style="width: 250px;" size="mini"></el-input>
                  <el-button type="primary" size="mini" style="margin-left:2px;" @click="handUpdateFile" :loading="fileUpdateLoading">更新</el-button>
                  <div style="float:right;">
                    <span style="font-size:14px;">语法样式：</span>
                    <el-select v-model="editMode" style="width:100px;"  size="mini">
                      <el-option label="text" value="text"></el-option>
                      <el-option label="python" value="python"></el-option>
                      <el-option label="yaml" value="yaml"></el-option>
                      <el-option label="shell" value="shell"></el-option>
                    </el-select>
                  </div>
                </el-row>
                
                <code-editor class="editor-container" ref="codeEditor" v-model="file_content" :mode.sync="editMode" v-loading="fileLoading" :element-loading-text="fileLoadingText"
                element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)"/>
              </div>
        </el-col>
    </el-row>

    <el-dialog title="创建" :visible.sync="dialogCreateVisible" width="25%" :close-on-press-escape="false" :close-on-click-modal="false" :show-close="false">
      <el-form ref="createDataForm" :model="createData" label-width="80px" :rules="createRules">
        <el-form-item label="类型:">
          <el-radio-group v-model="createData.type">
            <el-radio label="f">文件</el-radio>
            <el-radio label="d">文件夹</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="name" label="名称:" class="is-required">
          <el-input ref="createName_focus" v-model="createData.name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCreateVisible = false" :disabled="createLoading">关闭</el-button>
        <el-button type="primary" @click="handCreateFile" :loading="createLoading">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="重命名" :visible.sync="dialogRenameVisible" width="25%" :close-on-press-escape="false" :close-on-click-modal="false" :show-close="false">
      <el-form ref="renameDataForm" :model="renameData" label-width="80px" :rules="renameRules">
        <el-form-item label="原名称:" class="is-required">
          <el-input v-model="renameData.old_name" disabled></el-input>
        </el-form-item>
        <el-form-item prop="new_name" label="新名称:" class="is-required">
          <el-input ref="newName_focus" v-model="renameData.new_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogRenameVisible = false" :disabled="renameLoading">关闭</el-button>
        <el-button type="primary" @click="handRenameFile" :loading="renameLoading">确定</el-button>
      </div>
    </el-dialog>

    <!-- 因为本页面删除操作不再请求刷新文件树，不然会变成全部缩起来的状态，所以用弹出框来写删除，一般可以刷新页面的就直接用删除确认框简单点 -->
    <el-dialog title="提示" :visible.sync="dialogDeleteVisible" width="25%" :close-on-press-escape="false" :close-on-click-modal="false" :show-close="false">
      <div class="el-message-box__status el-icon-warning"></div>
      <div class="el-message-box__message"><p>此操作将永久删除该文件, 是否继续?</p></div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogDeleteVisible = false" :disabled="deleteLoading">关闭</el-button>
        <el-button type="primary" @click="handDeleteFile" :loading="deleteLoading">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="上传文件" :visible.sync="dialogUploadVisible" width="25%" :close-on-press-escape="false" :close-on-click-modal="false" :show-close="false">
      <el-upload
        class="upload-demo"
        ref="upload"
        action=""
        :file-list="fileList"
        :auto-upload="false"
        :on-change="handleChange"
        :on-remove="handleRemove"
        drag
        style="text-align:center">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击选取</em></div>
        <div slot="tip" class="el-upload__tip">文件超过5M请于管理员联系</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogUploadVisible = false" :disabled="uploadLoading">关闭</el-button>
        <el-button type="primary" @click="handUploadFile" :loading="uploadLoading">上传</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import elDragDialog from '@/directive/el-dragDialog' // base on element-ui
import { getFileTree, getFileContent, getFileUpdate, getFileCreate, getFileRename, getFileDelete, getFileUpload  } from '@/api/saltstack'
import waves from '@/directive/waves' // Waves directive
import { Message } from 'element-ui'
import CodeEditor from '@/components/CodeEditor'




export default {
  name: 'FileServer',
  directives: { elDragDialog, waves },
  components: { CodeEditor },
  data() {
    return {
      file_tree: [],
      max_id: 100,
      listLoading: false,
      listLoadingText:'正在加载目录..',
      data_list: [],
      defaultProps: {
          children: 'children',
          label: 'label'
        },
      nodeData:'',
      uploadStatus:true,
      createStatus:true,
      renameStatus:true,
      openStatus:true,
      deleteStatus:true,
      // 存放文件打开内容
      file_content:'',
      editMode:  'text',
      full_path: '',
      open_file_path: '',
      open_file_name: '',
      fileLoading: false,
      fileLoadingText: '正在读取文件...',
      fileUpdateLoading:false,
      dialogCreateVisible:false,
      createLoading:false,
      createData: {type:'f', name: null},
      createRules:{name:{required: true, message: '请输入名称', trigger: 'blur'},},
      dialogRenameVisible:false,
      renameLoading:false,
      renameData: {old_name:null, new_name:null},
      renameRules:{new_name:{required: true, message: '请输入名称', trigger: 'blur'},},
      dialogDeleteVisible: false,
      deleteLoading: false,
      clickNode: '',
      dialogUploadVisible : false,
      uploadLoading : false,
      fileList: []

    }
  },
  watch: {
    
  },
  created() {
    this.getFileList()
  },
  methods: {
   // 获取树状列表,第一次进入好看加点loading
    getFileList() {
      this.listLoading = true
      getFileTree().then(response => {
        if(response.data.status){
          this.file_tree = response.data.results
          this.max_id = response.data.max_id
          setTimeout(() => {
            this.listLoading = false
          }, 0.5 * 1000)
        }
        else{
          let result_data = response.data.results
          console.log(JSON.stringify(result_data));
          Message.error(JSON.stringify(result_data))
        }
      }).catch(error => {
        console.log('获取树状列表异常' + error)
        this.listLoading = false
      })
    },
    // 获取选中节点信息
    handleNodeClick(data) {
      this.nodeData = data
      if(this.nodeData.id==1){
        this.deleteStatus = true
        this.renameStatus = true
        this.deleteStatus = true
        this.openStatus = true
        this.uploadStatus = false
        this.createStatus = false
      }else if(this.nodeData.type=='d'){
        this.uploadStatus=this.createStatus=this.renameStatus=this.deleteStatus = false
        this.openStatus = true
      }else{
        this.uploadStatus=this.createStatus = true
        this.openStatus=this.renameStatus=this.deleteStatus = false
      }
      this.full_path = this.nodeData.full_path
    },
    // 打开文件内容
    handOpenFile(){
      if(this.nodeData == '' || this.nodeData.type == 'd'){
        Message.warning('请选择要打开的文件')
      }else if(parseInt(this.nodeData.size)>5242880){
        Message.warning('该文件超过5M，如需打开请联系管理员')
      }
      else{
        let data = {
          file_path:this.nodeData.full_path,
          file_size:this.nodeData.size,
          file_type:this.nodeData.type
        }
        this.fileLoading = true,
        getFileContent(data).then(response => {
          if(response.data.status){
            this.file_content = response.data.results
            this.fileLoading = false
            this.open_file_path = this.nodeData.full_path
            this.open_file_name = this.nodeData.label
          }
          else{
            let result_data = response.data.results
            console.log(JSON.stringify(result_data));
            Message.error(JSON.stringify(result_data))
            this.fileLoading = false
          }
        }).catch(error => {
          console.log('打开文件异常' + error)
          this.fileLoading = false
        })
      } 
    },
    // 更新文件
    handUpdateFile(){
      if(!this.open_file_path){
        Message.error('请先打开需要更新的文件')
      }else{
        this.$confirm(`确定要更新文件${this.open_file_name}吗?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            if(parseInt(this.nodeData.size)>5242880){
              Message.warning('文件大小超过5M，如需更新请联系管理员')
              return false
            }
            let data = {}
            data.file = this.file_content
            data.file_name = this.open_file_name
            data.file_path = this.open_file_path
            console.log(this.file_content);
            this.fileUpdateLoading = true
            getFileUpdate(data).then(response => {
              if(response.data.status){
                Message.success(JSON.stringify(response.data.results))
                this.fileUpdateLoading = false
              }
              else{
                let result_data = response.data.results
                console.log(JSON.stringify(result_data));
                Message.error(JSON.stringify(result_data))
                this.fileUpdateLoading = false
              }
            }).catch(error => {
              console.log('更新文件异常' + error)
              this.fileUpdateLoading = false
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消更新'
            });          
          });
      }  
    },

    // 创建文件或者文件夹弹出框
    handCreateDialog(){
      this.createData = {type:'f', name: null}
      this.dialogCreateVisible = true
      // 弹出框延时清空
      this.$nextTick(()=>{
        this.$refs['createName_focus'].focus();
        this.$refs['createDataForm'].clearValidate()
      })
    },

    // 创建文件或者文件夹
    handCreateFile(){
      this.$refs['createDataForm'].validate((valid) => {
        if (valid) {
          let newChild = { 
            id: this.max_id++, 
            label: this.createData.name, 
            type: this.createData.type , 
            full_path: `${this.nodeData.full_path}/${this.createData.name}`,
            size: this.createData.type=='d'?4096:0,
            floor: this.nodeData.floor+1
          };
          if (!this.nodeData.children) {
            this.$set(this.nodeData, 'children', []);
          }else{
            for(var value of this.nodeData.children){
              if(value.label == newChild.label&&value.type == newChild.type){
                Message.error('文件或文件夹已存在无法再创建')
                return false
              }
            }
          }
          let data = {
            file_path:newChild.full_path,
            file_type:newChild.type
          }
          this.createLoading = true,
          getFileCreate(data).then(response => {
            if(response.data.status){
              Message.success(response.data.results)
              this.createLoading = false
              this.dialogCreateVisible = false
              this.nodeData.children.push(newChild);
            }
            else{
              let result_data = response.data.results
              console.log(JSON.stringify(result_data));
              Message.error(JSON.stringify(result_data))
              this.createLoading = false
            }
          }).catch(error => {
            console.log('创建文件异常' + error)
            this.createLoading = false
          })
        } else{
          return false
        }
      });
    },

    // 重命名文件或者文件夹弹出框
    handRenameDialog(){
      this.renameData = {old_name:this.nodeData.label, new_name:null},
      this.dialogRenameVisible = true
      // 弹出框延时清空
      this.$nextTick(()=>{
        this.$refs['newName_focus'].focus();
        this.$refs['renameDataForm'].clearValidate()
      })
    },

    // 重命名文件或者文件夹
    handRenameFile(){
      this.$refs['renameDataForm'].validate((valid) => {
        if (valid) {
          // 通过this.clickNode的值获取到父目录，然后获取整个同级文件
          const children = this.clickNode.parent.data.children
          for(var value of children){
            if(value.label == this.renameData.new_name&&value.type == this.nodeData.type){
              Message.error('文件或文件夹已存在无法重命名')
              return false
            }
          }
          // 下面是拼接新文件的路径
          let pos = this.nodeData.full_path.lastIndexOf('/')
          let path = this.nodeData.full_path.substr(0, pos)
          let data = {
            old_name:this.nodeData.full_path,
            new_name:`${path}/${this.renameData.new_name}`
          }
          this.renameLoading = true
          getFileRename(data).then(response => {
            if(response.data.status){
              Message.success(response.data.results)
              this.renameLoading = false
              this.dialogRenameVisible = false
              this.nodeData.label = this.renameData.new_name;
              this.nodeData.full_path = data.new_name;
            }
            else{
              let result_data = response.data.results
              console.log(JSON.stringify(result_data));
              Message.error(JSON.stringify(result_data))
              this.renameLoading = false
            }
          }).catch(error => {
            console.log('重命名异常' + error)
            this.renameLoading = false
          })
        } else{
          return false
        }
      });
    },

    // 删除文件或者文件夹弹出框
    handDeleteDialog(){
      this.dialogDeleteVisible = true
    },

    // 删除文件或者文件夹
    handDeleteFile(){
      let data = {
        file_path:this.nodeData.full_path,
      }
      this.deleteLoading = true
      getFileDelete(data).then(response => {
        if(response.data.status){
          Message.success(response.data.results)
          const parent = this.clickNode.parent;
          const children = parent.data.children || parent.data;
          const index = children.findIndex(d => d.id === this.nodeData.id);
          children.splice(index, 1);
          this.dialogDeleteVisible = false
          this.deleteLoading = false
          this.uploadStatus=this.createStatus=this.renameStatus=this.deleteStatus=this.renameStatus=this.openStatus = true
        }
        else{
          let result_data = response.data.results
          console.log(JSON.stringify(result_data));
          Message.error(JSON.stringify(result_data))
          this.dialogDeleteVisible = false
          this.deleteLoading = false
        }
      }).catch(error => {
        console.log('删除失败：' + error)
        this.dialogDeleteVisible = false
        this.deleteLoading = false
      })

    },

    //上传文件弹出框
    handUploadDialog(){
      this.dialogUploadVisible = true
      this.fileList = []
    },

    // 上传文件
    handUploadFile(){
      const formData = new FormData()
      formData.append('file_path', this.nodeData.full_path)
      if(this.fileList.length>0 && this.fileList[0]['status'] === 'ready'){
        formData.append('file', this.fileList[0].raw)
      }else{
        Message.warning("请选择要上传的文件")
        return false
      }

      let newChild = { 
        id: this.max_id++, 
        label: this.fileList[0].name, 
        type: "f" , 
        full_path: `${this.nodeData.full_path}/${this.fileList[0]['name']}`,
        size: this.fileList[0].size,
        floor: this.nodeData.floor+1
      };
      
      getFileUpload(formData).then(response => {
        if(response.data.status){
          Message.success(response.data.results)
          this.nodeData.children.push(newChild);
          this.fileList = []
          this.dialogUploadVisible = false
          this.uploadLoading = false
        }
        else{
          let result_data = response.data.results
          console.log(JSON.stringify(result_data));
          Message.error(JSON.stringify(result_data))
          this.uploadLoading = false
        }
      }).catch(error => {
        console.log('上传失败：' + error)
        this.uploadLoading = false
      })

    },

    // 当选择好文件的时候，因为我取消自动上传所以不会把图片保存到变量this.fileList里,所以需要人为来存入
    // 另外file是当前添加的文件，而fileList是文件列表，我用fileList.slice(-1)来实现只能上传单文件而不是用limit参数来
    // 因为用limit是添加超过后无法添加依然要写逻辑麻烦
    handleChange(file, fileList) {
      const isLt2M = file.raw.size / 1024 / 1024 < 5;
      if (!isLt2M) {
        this.$message.error('文件大小不能超过 5MB!');
        this.fileList = []
        return false
      }
      this.fileList = fileList.slice(-1)
    },
    // 移除文件的时候把对应变量的值也移除，因为this.fileList是手动设置的所以得手动删除，不然当点击删除图标的时候实际上并没有真的删除文件
    handleRemove(file, fileList) {
      this.fileList = []
    },



  }  
}
</script>


<style rel="stylesheet/scss" lang="scss" scoped>
.app-container{
  .overflow_set{
    height: calc(100vh - 204px);
    overflow: auto;
  }
  .saltcmd-info-textarea /deep/ .el-textarea__inner{
    background-color: #000;
    color: #00B600;
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    padding-right: 8px;
    .card-node-icon{
      float: left;
      font-size: 16px;
      margin-right: 3px;
    }
  }
  
  .editor-div {
    border: 1px solid rgb(204, 204, 204);
    border-radius: 4px;
  }

    .editor-container{
      font-size: 17px;
      line-height: 100%;
      height: calc(100vh - 230px);
      background-color: #272822;
      border: none;
      border-radius:0 0 4px 4px;
    }
  
  
}


</style>