const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");

async function testAddShop() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    // 1. Open the Admin Shops page - update URL as needed
    await driver.get("http://localhost:5173/adminShops");
    console.log("Admin Shops page loaded");

    // 2. Wait for the Add New button to be located and visible (20 seconds timeout)
    const addButton = await driver.wait(
      until.elementLocated(By.css("button.AddButton")),
      20000,
      "Add New button not found on page"
    );
    await driver.wait(until.elementIsVisible(addButton), 5000);
    console.log("Add New button is visible");

    // 3. Click the Add New button to open modal
    await addButton.click();

    // 4. Wait for modal inputs to appear (use selectors from your modal)
    const shopNameInput = await driver.wait(
      until.elementLocated(By.css('input[placeholder="Enter Shop Name"]')),
      10000
    );
    const locationInput = await driver.findElement(
      By.css('input[placeholder="Enter Location"]')
    );
    const contactInput = await driver.findElement(
      By.css('input[placeholder="Enter Contact Number"]')
    );

    // 5. Fill the inputs
    await shopNameInput.sendKeys("Test Shop");
    await locationInput.sendKeys("Test Location");
    await contactInput.sendKeys("123456789");

    // 6. Click Save button
    const saveButton = await driver.findElement(By.css("button.SaveButton"));
    await saveButton.click();

    // 7. Handle alert popup (e.g., "Shop added successfully")
    await driver.wait(until.alertIsPresent(), 5000);
    let alert = await driver.switchTo().alert();
    console.log("Alert text:", await alert.getText());
    await alert.accept();

    // 8. Wait for modal to close (optional, but good to ensure save finished)
    await driver.wait(
      async () => {
        const modals = await driver.findElements(By.css(".Modal"));
        return modals.length === 0;
      },
      10000,
      "Modal did not close after saving"
    );

    // 9. Reload the page
    await driver.navigate().refresh();

    // 10. Wait for page to load and the new shop to appear on the refreshed list
    await driver.wait(
      until.elementLocated(By.xpath("//h2[text()='Test Shop']")),
      10000,
      "New shop did not appear in the list after reload"
    );

    console.log("Add shop test passed!");
  } catch (error) {
    console.error("❌ Add shop test failed:", error.message);

    // Save screenshot on failure
    const screenshot = await driver.takeScreenshot();
    const fileName = `error-add-shop-${new Date()
      .toISOString()
      .replace(/:/g, "-")}.png`;
    fs.writeFileSync(fileName, screenshot, "base64");
    console.log(`📸 Screenshot saved as ${fileName}`);

    // Save page source for debugging
    const pageSource = await driver.getPageSource();
    fs.writeFileSync("page-source.html", pageSource);
    console.log("📝 Page source saved as page-source.html");
  } finally {
    await driver.quit();
  }
}

testAddShop();
