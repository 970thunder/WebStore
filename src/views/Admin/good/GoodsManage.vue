<script setup>
import '@/assets/el.css';

import {
  Edit,
  Delete
} from '@element-plus/icons-vue'

import { ref } from 'vue'

//商品分类数据模型
const categorys = ref([
])

//用户搜索时选中的分类id
const categoryId = ref('')

//用户搜索时选中的发布状态
const isAvailable = ref('')

//商品列表数据模型
const goods = ref([
])

//分页条数据模型
const pageNum = ref(1)//当前页
const total = ref(20)//总条数
const pageSize = ref(5)//每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
  pageSize.value = size
  goodList();
}
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
  pageNum.value = num
  goodList();
}

//请求获取商品分类
import { goodCategoryListService, goodListService, goodAddService, goodUpdateService, goodDeleteService } from '@/api/good.js'

//获取商品分类列表
const goodCategoryList = async () => {
  let result = await goodCategoryListService();

  categorys.value = result.data;
}

//获取商品列表数据
const goodList = async () => {
  let params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    categoryId: categoryId.value ? categoryId.value : null,
    isAvailable: isAvailable.value ? isAvailable.value : null
  }

  //调用接口获取商品列表数据
  let result = await goodListService(params);
  //渲染视图
  total.value = result.data.total;
  goods.value = result.data.items;

  for (let i = 0; i < goods.value.length; i++) {
    let good = goods.value[i];
    //根据商品分类id，获取商品分类名称并展示
    for (let j = 0; j < categorys.value.length; j++) {
      if (good.categoryId === categorys.value[j].id) {
        good.categoryName = categorys.value[j].categoryName;
      }
    }
  }
  goods.value.forEach(good => {
    // 格式化时间
    good.createTime = new Date(good.createTime).toLocaleString(); // 使用toLocaleString方法进行简单格式化
    // 此处可以使用其他方法来进行更细致的时间格式化
  });
}

goodCategoryList();
goodList();

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { Plus } from '@element-plus/icons-vue'
//控制抽屉是否显示
const visibleDrawer = ref(false)
//添加表单数据模型
const goodModel = ref({
  name: '',
  description: '',
  imageUrl: '',
  price: '',
  stock: '',
  isAvailable: '',
  categoryId: '',
})

import { useTokenStore } from '@/stores/token.js';
const tokenStore = useTokenStore();
const uploadSuccess = (result) => {
  goodModel.value.imageUrl = result.data;
  console.log(result.data);
}

import { ElMessage } from 'element-plus'
const addGood = async (clickState) => {
  //把发布状态赋值给表单模型
  goodModel.value.isAvailable = clickState;
  //调用接口添加商品
  let result = await goodAddService(goodModel.value);

  ElMessage.success(result.msg ? result.msg : '添加成功');
  //关闭抽屉
  visibleDrawer.value = false;
  //刷新商品列表数据
  goodList();
}

const title = ref('')
const showEditDialog = (row) => {
  //打开抽屉
  visibleDrawer.value = true;
  title.value = '编辑商品';
  //渲染表单数据
  goodModel.value.name = row.name;
  goodModel.value.description = row.description;
  goodModel.value.imageUrl = row.imageUrl;
  goodModel.value.price = row.price;
  goodModel.value.stock = row.stock;
  goodModel.value.isAvailable = row.isAvailable;
  goodModel.value.categoryId = row.categoryId;
  goodModel.value.id = row.id;
}

//更新商品信息
const updateGood = async (clickState) => {
  goodModel.value.isAvailable = clickState;
  let result = await goodUpdateService(goodModel.value);
  ElMessage.success(result.msg ? result.msg : '修改成功');

  //刷新商品列表数据
  goodList();
  //关闭抽屉
  visibleDrawer.value = false;
}

const clearData = () => {
  goodModel.value.name = '';
  goodModel.value.description = '<p></p>';
  goodModel.value.imageUrl = '';
  goodModel.value.price = '';
  goodModel.value.stock = '';
  goodModel.value.categoryId = '';
  goodModel.value.isAvailable = '';
}

import { ElMessageBox } from 'element-plus';
//删除商品
const deleteGood = async (row) => {
  ElMessageBox.confirm(
    '你确认删除该商品吗？',
    '温馨提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      // 用户点击了确认
      // 调用删除接口
      let result = await goodDeleteService(row.id); // 假设这是删除商品的接口函数
      ElMessage({
        type: 'success',
        message: '删除成功',
      });
      goodList(); // 刷新商品列表
    })
    .catch(() => {
      // 用户点击了取消
      ElMessage({
        type: 'info',
        message: '取消删除',
      });
    });

}
</script>
<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>商品管理</span>
        <div class="extra">
          <el-button type="primary" @click="title = '添加商品'; visibleDrawer = true; clearData()">添加商品</el-button>
        </div>
      </div>
    </template>
    <!-- 搜索表单 -->
    <el-form inline>
      <el-form-item label="商品分类：">
        <el-select placeholder="请选择" v-model="categoryId" style="width: 150px">
          <el-option v-for="c in categorys" :key="c.id" :label="c.categoryName" :value="c.id">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="发布状态：">
        <el-select placeholder="请选择" v-model="isAvailable" style="width: 150px">
          <el-option label="已发布" value="已发布"></el-option>
          <el-option label="草稿" value="草稿"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="goodList">搜索</el-button>
        <!-- 重置就是让搜索条件全部清空,然后再次调用接口重新获取商品列表数据（刷新） -->
        <el-button @click="categoryId = ''; isAvailable = ''; goodList()">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 商品列表 -->
    <div class="goods-list-container">
      <el-table :data="goods" style="width: 100%">
        <el-table-column label="商品标题" width="400" prop="name"></el-table-column>
        <el-table-column label="分类" prop="categoryName"></el-table-column>
        <el-table-column label="上架时间" prop="createTime"> </el-table-column>
        <el-table-column label="状态" prop="isAvailable"></el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <!-- 编辑按钮 -->
            <el-button :icon="Edit" circle plain type="primary" @click="showEditDialog(row)"></el-button>
            <!-- 删除按钮 -->
            <el-button :icon="Delete" circle plain type="danger" @click="deleteGood(row)"></el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="没有数据" />
        </template>
      </el-table>
    </div>
    <!-- 分页条 -->
    <template #footer>
      <div class="footer">
        <div class="pagination">
          <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize"
            :page-sizes="[5, 10, 15, 20, 50, 100]" layout="jumper, total, sizes, prev, pager, next" background
            :total="total" style="margin-left: auto;" @size-change="onSizeChange" @current-change="onCurrentChange" />
        </div>
      </div>
    </template>

    <!-- 抽屉 -->
    <el-drawer v-model="visibleDrawer" :title="title" direction="rtl" size="50%">
      <!-- 添加商品表单 -->
      <el-form :model="goodModel" label-width="100px">
        <el-form-item label="商品标题">
          <el-input v-model="goodModel.name" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select placeholder="请选择" v-model="goodModel.categoryId">
            <el-option v-for="c in categorys" :key="c.id" :label="c.categoryName" :value="c.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品价格">
          <el-input v-model="goodModel.price" placeholder="请输入价格"></el-input>
        </el-form-item>
        <el-form-item label="商品库存">
          <el-input v-model="goodModel.stock" placeholder="请输入库存数量"></el-input>
        </el-form-item>
        <el-form-item label="商品图片">

          <el-upload class="avatar-uploader" :auto-upload="true" :show-file-list="false" action="/api/upload"
            name="file" :headers="{ 'Authorization': tokenStore.token }" :on-success="uploadSuccess">
            <img v-if="goodModel.imageUrl" :src="goodModel.imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="商品描述">
          <div class="editor">
            <quill-editor theme="snow" v-model:content="goodModel.description" contentType="html">
            </quill-editor>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="title == '添加商品' ? addGood('已发布') : updateGood('已发布')">发布</el-button>
          <el-button type="info" @click="title == '添加商品' ? addGood('草稿') : updateGood('草稿')">草稿</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </el-card>


</template>
<style lang="scss" scoped>
.page-container {
  background-color: #f5f7ff;
  min-height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* 商品列表容器样式 */
  .goods-list-container {
    flex: 1;
    /* 允许容器填充剩余空间 */
    overflow-y: auto;
    /* 启用垂直滚动 */
    max-height: 51vh;
    /* 设置固定最大高度 */
  }
  
}

:deep(.el-card__body) {
  flex: 1;
}

// 分页条居右
.pagination {
  width: 100%;
  display: flex;
}

/* 抽屉样式 */
.avatar-uploader {
  :deep() {
    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }

    .el-upload {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
    }

    .el-upload:hover {
      border-color: var(--el-color-primary);
    }

    .el-icon.avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
    }
  }
}

.editor {
  width: 100%;

  :deep(.ql-editor) {
    min-height: 200px;
  }
}
</style>