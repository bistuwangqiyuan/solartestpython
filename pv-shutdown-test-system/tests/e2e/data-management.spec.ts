import { test, expect } from '@playwright/test';

test.describe('数据管理功能测试', () => {
  const baseURL = 'https://vocal-vacherin-2f3f91.netlify.app';

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/data`);
    await page.waitForLoadState('networkidle');
  });

  test('数据导入功能测试', async ({ page }) => {
    // 检查导入按钮
    await expect(page.locator('text=导入数据')).toBeVisible();
    
    // 测试文件选择
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // 模拟文件上传（使用示例数据）
    const filePath = 'data/sample_data_1.json';
    await fileInput.setInputFiles(filePath);
    
    // 检查上传状态
    await expect(page.locator('text=文件上传中')).toBeVisible();
    
    // 等待处理完成
    await page.waitForSelector('text=数据导入成功', { timeout: 10000 });
  });

  test('数据预览功能测试', async ({ page }) => {
    // 检查数据表格
    const dataTable = page.locator('.data-table');
    await expect(dataTable).toBeVisible();
    
    // 检查表格头部
    await expect(page.locator('th:has-text("序号")')).toBeVisible();
    await expect(page.locator('th:has-text("电流(A)")')).toBeVisible();
    await expect(page.locator('th:has-text("电压(V)")')).toBeVisible();
    await expect(page.locator('th:has-text("功率(W)")')).toBeVisible();
    
    // 检查数据行
    const dataRows = page.locator('.data-table tbody tr');
    await expect(dataRows).toHaveCount(10); // 示例数据有10行
  });

  test('数据导出功能测试', async ({ page }) => {
    // 检查导出按钮
    await expect(page.locator('text=导出数据')).toBeVisible();
    
    // 测试导出功能
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=导出数据');
    const download = await downloadPromise;
    
    // 验证下载文件
    expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx)$/);
  });

  test('数据筛选功能测试', async ({ page }) => {
    // 检查筛选控件
    await expect(page.locator('input[placeholder*="筛选"]')).toBeVisible();
    
    // 测试筛选功能
    await page.fill('input[placeholder*="筛选"]', '电流');
    
    // 检查筛选结果
    const filteredRows = page.locator('.data-table tbody tr');
    await expect(filteredRows).toHaveCount(1); // 应该只显示包含"电流"的行
  });

  test('数据分页功能测试', async ({ page }) => {
    // 检查分页控件
    const pagination = page.locator('.pagination');
    await expect(pagination).toBeVisible();
    
    // 测试分页导航
    const nextButton = page.locator('button:has-text("下一页")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');
      
      // 检查页码更新
      await expect(page.locator('.pagination .active')).toContainText('2');
    }
  });

  test('数据统计功能测试', async ({ page }) => {
    // 检查统计信息
    await expect(page.locator('text=数据统计')).toBeVisible();
    
    // 检查统计指标
    await expect(page.locator('text=总记录数')).toBeVisible();
    await expect(page.locator('text=平均电压')).toBeVisible();
    await expect(page.locator('text=平均电流')).toBeVisible();
    await expect(page.locator('text=平均功率')).toBeVisible();
    
    // 验证统计数值
    const totalRecords = page.locator('[data-testid="total-records"]');
    await expect(totalRecords).toContainText('10');
  });
});
