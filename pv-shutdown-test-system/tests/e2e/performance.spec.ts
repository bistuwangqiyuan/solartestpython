import { test, expect } from '@playwright/test';

test.describe('性能测试', () => {
  const baseURL = 'https://vocal-vacherin-2f3f91.netlify.app';

  test('页面加载性能测试', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 页面加载时间应该在3秒内
    expect(loadTime).toBeLessThan(3000);
    
    // 检查关键资源加载
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(r => ({
        name: r.name,
        duration: r.duration,
        size: r.transferSize
      }));
    });
    
    // 检查是否有资源加载失败
    const failedResources = resources.filter(r => r.duration === 0);
    expect(failedResources).toHaveLength(0);
  });

  test('数据大屏性能测试', async ({ page }) => {
    await page.goto(`${baseURL}/`);
    
    const startTime = Date.now();
    
    // 等待图表渲染完成
    await page.waitForSelector('.chart-container', { timeout: 5000 });
    await page.waitForLoadState('networkidle');
    
    const renderTime = Date.now() - startTime;
    
    // 图表渲染时间应该在2秒内
    expect(renderTime).toBeLessThan(2000);
    
    // 检查内存使用
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize
      } : null;
    });
    
    if (memoryUsage) {
      // 内存使用应该在合理范围内（小于50MB）
      expect(memoryUsage.used).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('数据管理页面性能测试', async ({ page }) => {
    await page.goto(`${baseURL}/data`);
    
    const startTime = Date.now();
    
    // 等待数据表格加载
    await page.waitForSelector('.data-table', { timeout: 5000 });
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 数据加载时间应该在2秒内
    expect(loadTime).toBeLessThan(2000);
    
    // 检查表格渲染性能
    const tableRows = await page.locator('.data-table tbody tr').count();
    expect(tableRows).toBeGreaterThan(0);
  });

  test('仿真系统性能测试', async ({ page }) => {
    await page.goto(`${baseURL}/simulation`);
    
    const startTime = Date.now();
    
    // 等待仿真界面加载
    await page.waitForSelector('.circuit-simulator', { timeout: 5000 });
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 仿真界面加载时间应该在2秒内
    expect(loadTime).toBeLessThan(2000);
    
    // 测试仿真启动性能
    await page.click('text=开始仿真');
    
    const simulationStartTime = Date.now();
    await page.waitForSelector('.simulation-running', { timeout: 3000 });
    const simulationTime = Date.now() - simulationStartTime;
    
    // 仿真启动时间应该在1秒内
    expect(simulationTime).toBeLessThan(1000);
  });

  test('网络请求性能测试', async ({ page }) => {
    const requests: any[] = [];
    
    // 监听网络请求
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        startTime: Date.now()
      });
    });
    
    page.on('response', response => {
      const request = requests.find(r => r.url === response.url());
      if (request) {
        request.endTime = Date.now();
        request.duration = request.endTime - request.startTime;
        request.status = response.status();
      }
    });
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // 检查API请求性能
    const apiRequests = requests.filter(r => r.url.includes('/api/'));
    for (const request of apiRequests) {
      expect(request.duration).toBeLessThan(1000); // API请求应该在1秒内完成
      expect(request.status).toBeLessThan(400); // 没有4xx错误
    }
  });

  test('并发用户性能测试', async ({ browser }) => {
    const contexts = [];
    const pages = [];
    
    // 创建多个浏览器上下文模拟并发用户
    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      contexts.push(context);
      pages.push(page);
    }
    
    const startTime = Date.now();
    
    // 并发访问页面
    await Promise.all(pages.map(page => page.goto(baseURL)));
    await Promise.all(pages.map(page => page.waitForLoadState('networkidle')));
    
    const totalTime = Date.now() - startTime;
    
    // 并发访问时间应该在5秒内
    expect(totalTime).toBeLessThan(5000);
    
    // 清理资源
    await Promise.all(contexts.map(context => context.close()));
  });
});
