<script setup>
import '@/assets/el.css';

import {
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { ref,watch } from 'vue'
const categorys = ref([

])

const categoryName = ref('')
const categoryAlias = ref('')
const filteredCategories = ref([]); // 筛选后的分类


//声明异步函数
import { goodCategoryListService, goodCategoryAddService, goodCategoryUpdateService, goodCategoryDeleteService } from '@/api/good.js'
const goodCategoryList = async () => {
  let result = await goodCategoryListService();
  categorys.value = result.data;
  filteredCategories.value = categorys.value; // 初始化时展示所有分类
}

watch(categoryName, (newVal) => {
  filteredCategories.value = categorys.value.filter((item) =>
    item.categoryName.includes(newVal)
  );
});

goodCategoryList();
//控制添加分类弹窗
const dialogVisible = ref(false)

//添加分类数据模型
const categoryModel = ref({
  categoryName: '',
  categoryAlias: ''
})



//添加分类表单校验
const rules = {
  categoryName: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
  ],
  categoryAlias: [
    { required: true, message: '请输入分类别名', trigger: 'blur' },
  ]
}


import { ElMessage } from 'element-plus'
//添加分类
const addCategory = async () => {
  let result = await goodCategoryAddService(categoryModel.value);
  ElMessage.success(result.msg ? result.msg : '添加成功')
  goodCategoryList();
  dialogVisible.value = false;
}

//控制标题展示
const title = ref('')
//展示编辑弹窗
const showDialog = (row) => {
  dialogVisible.value = true; title.value = '编辑分类'
  //数据拷贝
  categoryModel.value.categoryName = row.categoryName;
  categoryModel.value.categoryAlias = row.categoryAlias;
  categoryModel.value.id = row.id;
}

//更新分类
const updateCategory = async () => {
  let result = await goodCategoryUpdateService(categoryModel.value)
  ElMessage.success(result.message ? result.message : '修改成功')

  //再次访问后台接口，查询所有分类
  goodCategoryList();
  //隐藏弹窗
  dialogVisible.value = false

}

const clearData = () => {
  categoryModel.value.categoryName = '';
  categoryModel.value.categoryAlias = '';
}

import { ElMessageBox } from 'element-plus'
const deleteCategory = (row) => {
  ElMessageBox.confirm(
    '你确认删除该分类信息吗？',
    '温馨提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      //用户点击了确认
      //调用删除接口
      let result = await goodCategoryDeleteService(row.id);
      ElMessage({
        type: 'success',
        message: '删除成功',
      })
      goodCategoryList();
    })
    .catch(() => {
      //用户点击了取消
      ElMessage({
        type: 'info',
        message: '取消删除',
      })
    })
}
</script>


<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>商品分类</span>
        <div class="extra">
          <el-button type="primary" @click="title = '添加分类'; dialogVisible = true; clearData()">添加分类</el-button>
        </div>
      </div>
    </template>

    <!-- 搜索表单 -->
    <el-form inline>
      <el-form-item label="商品分类快捷搜索：">
        <el-input
          placeholder="请输入分类名称"
          style="width: 200px"
          v-model="categoryName"
          clearable
        />
      </el-form-item>
    </el-form>

    <!-- 分类列表 -->
    <el-table :data="filteredCategories" style="width: 100%">
      <el-table-column label="序号" width="100" type="index" />
      <el-table-column label="分类名称" prop="categoryName" />
      <el-table-column label="分类别名" prop="categoryAlias" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
            :icon="Edit"
            circle
            plain
            type="primary"
            @click="showDialog(row)"
          ></el-button>
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="deleteCategory(row)"
          ></el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有数据" />
      </template>
    </el-table>

    <!-- 添加分类弹窗 -->
    <el-dialog v-model="dialogVisible" :title="title" width="30%">
      <el-form :model="categoryModel" label-width="100px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="categoryModel.categoryName" minlength="1" maxlength="10" />
        </el-form-item>
        <el-form-item label="分类别名" prop="categoryAlias">
          <el-input v-model="categoryModel.categoryAlias" minlength="1" maxlength="15" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="title == '添加分类' ? addCategory() : updateCategory()">确认</el-button>
      </template>
    </el-dialog>
    
    <!-- 分页条 -->
    <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[3, 5, 10, 15]"
      layout="jumper, total, sizes, prev, pager, next" background :total="total" @size-change="onSizeChange"
      @current-change="onCurrentChange" style="margin-top: 20px; justify-content: flex-end" />
  </el-card>
</template>

<style lang="scss" scoped>
.page-container {
  background-color: #f5f7ff;
  min-height: 100%;
  box-sizing: border-box;

  
  .header {
    
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}



</style>