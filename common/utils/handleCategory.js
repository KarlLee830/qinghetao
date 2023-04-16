import isTypeof from './typeof'

// 获取选中的分类名称
export const getCategoryName = (categories, categoryIds) => {
    if (!isNull(categories, categoryIds)) {
      const id = categoryIds[0]
      if (id !== 'all') {
        let name = ''
        categories.forEach(item => {
          if (`${item.categoryId}` === `${id}`) {
            name = item.name
          } else {
            if (item.children?.length) {
                // 在一级分类中没有找到，再从二级分类中找
                item.children.forEach(children => {
                    if (`${children.categoryId}` === `${id}`) {
                        name = children.name
                    }
                })
            }
          }
        })
        return name
      }
    }
    return ''
}

 // 后台接口的分类数据不会包含「全部」，此处前端手动添加
export const getCategories = (categories, needDefault) => {
    if (!categories?.length) {
        return []
    }

    let newCategories = categories.slice()

    const tmpDefault = categories.filter(item => item.categoryId === 'default')
    if (needDefault && !tmpDefault.length) {
        newCategories.unshift({ name: '推荐', pid: 'default', children: [] });
    }

    // 判断是否包含「全部」
    const tmpAll = categories.filter(item => item.categoryId === 'all')
    if (!tmpAll.length) {
        newCategories.unshift({ name: '全部', pid: 'all', children: [] });
    }

    return newCategories;
};

// 获取当前被激活的一级分类pid
export const getActiveId = (categories, categoryIds) => {
  let cid = 'all'
  if (isNull(categories, categoryIds)) {
      return ['all', cid]
  }


  let id = categoryIds[0]
  const newId = resetCategoryIds(id);
  // 如果categoryIds中的元素有多个，那应该是一级分类被选中了
  if (categoryIds?.length > 1 || newId === '') {
      return [id, cid]
  }

  // 确定id是否是二级分类，如果是二级分类，则返回一级分类的pid
  categories.forEach((item) => {
      if (item.children?.length) {
        const tmp = item.children.filter(children => `${children.categoryId}` === `${newId}`);
        if (tmp.length) {
            id = item.categoryId;
            // 二级分类pid
            cid = tmp[0].categoryId
        }
      }
  });

  return [id, cid];
}

// 若选中的一级标签，存在二级标签，则将一级id和所有二级id全都传给后台
export const getSelectedCategoryIds = (categories, id) => {
    const newId = resetCategoryIds(id);
    if (newId === '') {
        return [id]
    }
    let newCategoryIds = [id];
    const tmp = categories.filter(item => `${item.categoryId}` === `${id}`);
    if (tmp?.length && tmp[0]?.children?.length) {
      tmp[0]?.children?.forEach((item) => {
        newCategoryIds.push(item.categoryId);
      });
    }
    return newCategoryIds
}

// 将字符串转成数组，且过滤掉不必要的参数
export const handleString2Arr = (dic, key) => {
    if (!isTypeof.isObject(dic) || !dic[key]) {
      return
    }

    const target = dic[key]
    let arr = [];
    if (target) {
      if (!(target instanceof Array)) {
        arr = [target];
      } else {
        arr = target;
      }
    }

    return arr?.filter(item => item !== 'all' && item !== 'default' && item !== '') || []
}

const isNull = (categories, categoryIds) => {
    return isTypeof.isArray(categories) && categories?.length && isTypeof.isArray(categoryIds) && categoryIds?.length
}

const resetCategoryIds = (id) => {
    return id === 'all' || id === 'default' ? '' : id;
}