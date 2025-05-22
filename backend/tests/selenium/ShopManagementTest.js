const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

(async function testShopManagement() {
  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().addArguments('--window-size=1920,1080'))
    .build();

  try {
    // 1. Navigate to admin shops
    await driver.get('http://localhost:5173/adminShops');
    console.log('📄 Page loaded');

    // --- ADD NEW SHOP ---
    console.log('➕ Starting add shop test...');
    
    const addButton = await driver.wait(until.elementLocated(By.css('button.AddButton')), 10000);
    await driver.wait(until.elementIsVisible(addButton), 5000);
    await addButton.click();

    const nameInput = await driver.wait(until.elementLocated(By.css('.Modal input[placeholder="Enter Shop Name"]')), 5000);
    await nameInput.sendKeys('Test Shop Selenium');

    const locationInput = await driver.findElement(By.css('.Modal input[placeholder="Enter Location"]'));
    await locationInput.sendKeys('Test Location');

    const contactInput = await driver.findElement(By.css('.Modal input[placeholder="Enter Contact Number"]'));
    await contactInput.sendKeys('1234567890');

    const saveButton = await driver.findElement(By.css('.Modal button.SaveButton'));
    await saveButton.click();

    // Handle success alert if it appears
    try {
      await driver.wait(until.alertIsPresent(), 5000);
      const alert = await driver.switchTo().alert();
      console.log('🔔 Alert text:', await alert.getText());
      await alert.accept();
    } catch (e) {
      console.log('ℹ️ No alert appeared (proceeding)');
    }

    // Wait for modal to close
    await driver.wait(until.stalenessOf(saveButton), 10000);

    // Verify added shop
    console.log('🔍 Verifying added shop...');
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Test Shop Selenium')]")), 10000);

    // --- EDIT SHOP ---
    console.log('✏️ Starting edit test...');
    
    const editButton = await driver.wait(until.elementLocated(
      By.xpath("//*[contains(text(), 'Test Shop Selenium')]/ancestor-or-self::*[contains(@class, 'ShopCard')]//button[contains(@class, 'EditButton')]")
    ), 10000);
    await editButton.click();

    const editNameInput = await driver.wait(until.elementLocated(By.css('.Modal input[placeholder="Enter Shop Name"]')), 5000);
    await editNameInput.clear();
    await editNameInput.sendKeys('Test Shop Selenium Updated');

    const updateButton = await driver.findElement(By.css('.Modal button.SaveButton'));
    await updateButton.click();

    // Handle alert if present
    try {
      await driver.wait(until.alertIsPresent(), 5000);
      const alert = await driver.switchTo().alert();
      console.log('🔔 Alert text:', await alert.getText());
      await alert.accept();
    } catch (e) {
      console.log('ℹ️ No alert appeared after edit');
    }

    await driver.wait(until.stalenessOf(updateButton), 10000);

    // Verify edit
    console.log('✅ Verifying edit...');
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Test Shop Selenium Updated')]")), 10000);

    // --- DELETE SHOP ---
// --- DELETE SHOP ---
console.log('🗑️ Starting delete test...');

const deleteButton = await driver.wait(until.elementLocated(
  By.xpath("//*[contains(text(), 'Test Shop Selenium Updated')]/ancestor-or-self::*[contains(@class, 'ShopCard')]//button[contains(@class, 'DeleteButton')]")
), 10000);
await deleteButton.click();

// First: confirm deletion
await driver.wait(until.alertIsPresent(), 5000);
const deleteAlert = await driver.switchTo().alert();
console.log('🔔 Delete alert text:', await deleteAlert.getText());
await deleteAlert.accept();

// Second: handle success alert
try {
  await driver.wait(until.alertIsPresent(), 5000);
  const successAlert = await driver.switchTo().alert();
  console.log('🔔 Success alert text:', await successAlert.getText());
  await successAlert.accept();
} catch (e) {
  console.log('ℹ️ No success alert after deletion');
}

// Now verify deletion
console.log('🔍 Verifying deletion...');
await driver.wait(async () => {
  const elements = await driver.findElements(By.xpath("//*[contains(text(), 'Test Shop Selenium Updated')]"));
  return elements.length === 0;
}, 10000);


    // Save screenshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `error-${timestamp}.png`;
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(fileName, screenshot, 'base64');
    console.log(`📸 Screenshot saved as ${fileName}`);
  } finally {
    await driver.quit();
  }
})();
