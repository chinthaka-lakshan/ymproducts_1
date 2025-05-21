const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
require('chromedriver');

(async function testAdminLogin() {
  let driver;
  
  try {
    console.log('🚀 Starting admin login test...');
    
    // 1. Initialize WebDriver
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new (require('selenium-webdriver/chrome').Options)()
        .addArguments('--window-size=1920,1080')
        .addArguments('--ignore-certificate-errors') // Add this for SSL issues
      )
      .build();

    // 2. Navigate to login page
    console.log('➡️ Loading login page...');
    await driver.get('http://localhost:5173');
    
    // 3. Enter credentials
    console.log('🔑 Entering admin credentials...');
    await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000)
      .sendKeys('admin@example.com');
    await driver.findElement(By.css('input[type="password"]'))
      .sendKeys('Admin@123');

    // 4. Click login
    console.log('🖱️ Clicking login button...');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // 5. Handle the success alert
    console.log('🔄 Handling success alert...');
    await driver.wait(until.alertIsPresent(), 5000);
    const alert = await driver.switchTo().alert();
    await alert.accept();
    
    // 6. Wait for dashboard to load
    console.log('🔍 Waiting for dashboard...');
    await driver.wait(until.urlContains('/admindashboard'), 10000);
    
    // 7. Verify dashboard content - Updated to match your actual dashboard
    console.log('✅ Verifying dashboard elements...');
    
    // Option 1: Check for the "ADMIN DASHBOARD" heading (case insensitive)
    const dashboardTitle = await driver.wait(
      until.elementLocated(By.xpath('//*[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "admin dashboard")]')),
      10000
    );
    
    // Option 2: Check for specific menu items
    const distributionStock = await driver.wait(
      until.elementLocated(By.xpath('//*[contains(text(), "Distribution Stock")]')),
      5000
    );

    assert.ok(
      await dashboardTitle.isDisplayed(),
      'Dashboard title not displayed'
    );
    assert.ok(
      await distributionStock.isDisplayed(),
      'Distribution Stock section not found'
    );

    console.log('🎉 Admin login test passed successfully!');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    
    // Enhanced debugging
    if (driver) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshot = await driver.takeScreenshot();
      require('fs').writeFileSync(`error-${timestamp}.png`, screenshot, 'base64');
      
      try {
        const currentUrl = await driver.getCurrentUrl();
        console.log(`🌐 Current URL: ${currentUrl}`);
        
        const pageSource = await driver.getPageSource();
        require('fs').writeFileSync(`page-${timestamp}.html`, pageSource);
      } catch (e) {
        console.log('⚠️ Could not capture additional debug info');
      }
    }
  } finally {
    if (driver) await driver.quit();
  }
})();