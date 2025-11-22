import { test, expect } from '@playwright/test';

test.describe('光伏关断器实验数据管理系统 - 基础功能测试', () => {
  const baseURL = 'https://vocal-vacherin-2f3f91.netlify.app';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
  });

  test('首页加载和基本导航', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/光伏关断器实验数据管理系统/);
    
    // 检查主要导航元素
    await expect(page.locator('text=数据大屏')).toBeVisible();
    await expect(page.locator('text=实验管理')).toBeVisible();
    await expect(page.locator('text=数据管理')).toBeVisible();
    await expect(page.locator('text=仿真系统')).toBeVisible();
  });

  test('数据大屏页面功能', async ({ page }) => {
    await page.click('text=数据大屏');
    await page.waitForLoadState('networkidle');
    
    // 检查数据大屏元素
    await expect(page.locator('text=实时监控')).toBeVisible();
    await expect(page.locator('text=设备状态')).toBeVisible();
    
    // 检查图表容器
    const chartContainers = page.locator('.chart-container');
    await expect(chartContainers).toHaveCount(3); // 电压、电流、功率图表
  });

  test('实验管理页面功能', async ({ page }) => {
    await page.click('text=实验管理');
    await page.waitForLoadState('networkidle');
    
    // 检查实验列表
    await expect(page.locator('text=实验列表')).toBeVisible();
    await expect(page.locator('text=新建实验')).toBeVisible();
    
    // 测试新建实验按钮
    await page.click('text=新建实验');
    await page.waitForLoadState('networkidle');
    
    // 检查新建实验表单
    await expect(page.locator('text=实验配置')).toBeVisible();
    await expect(page.locator('input[placeholder*="实验名称"]')).toBeVisible();
  });

  test('数据管理页面功能', async ({ page }) => {
    await page.click('text=数据管理');
    await page.waitForLoadState('networkidle');
    
    // 检查数据管理功能
    await expect(page.locator('text=数据导入')).toBeVisible();
    await expect(page.locator('text=数据导出')).toBeVisible();
    await expect(page.locator('text=数据预览')).toBeVisible();
    
    // 检查文件上传功能
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
  });

  test('仿真系统页面功能', async ({ page }) => {
    await page.click('text=仿真系统');
    await page.waitForLoadState('networkidle');
    
    // 检查仿真控制面板
    await expect(page.locator('text=参数配置')).toBeVisible();
    await expect(page.locator('text=开始仿真')).toBeVisible();
    await expect(page.locator('text=停止仿真')).toBeVisible();
    
    // 检查电路图
    await expect(page.locator('.circuit-simulator')).toBeVisible();
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试移动端视图
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // 检查移动端导航
    await expect(page.locator('text=数据大屏')).toBeVisible();
    
    // 测试平板端视图
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // 检查平板端布局
    await expect(page.locator('text=数据大屏')).toBeVisible();
  });

  test('错误处理测试', async ({ page }) => {
    // 测试无效路由
    await page.goto(`${baseURL}/invalid-route`);
    await expect(page.locator('text=404')).toBeVisible();
    
    // 测试网络错误处理
    await page.route('**/api/**', route => route.abort());
    await page.goto(baseURL);
    await page.waitForTimeout(2000);
    
    // 检查错误状态显示
    await expect(page.locator('text=连接失败')).toBeVisible();
  });
});
