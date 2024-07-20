const puppeteer = require('puppeteer');
const { updateTrafficDataRank } = require('./helpers/dbHelpers');

const generateTraffic = ({ url, keyword, stayTime, numBots, country, userId }) => {
    return async () => {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-infobars',
                    '--proxy-server=p.webshare.io:80'
                ]
            });

            const searchKeywordOnGoogle = async (page, keyword, url) => {
                try {
                    await page.authenticate({ username: 'iqginjvo-rotate', password: 'a2rgiep0kllk' });
                    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
                    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

                    // Check for reCAPTCHA and handle if found
                    if (await page.$('.g-recaptcha')) {
                        console.error(`reCAPTCHA found on Google search page. Skipping bot.`);
                        return; // Skip the bot if reCAPTCHA found
                    }

                    let found = false;
                    let rank = 1;

                    for (let i = 0; i < 10; i++) {
                        await page.waitForSelector('div.g a', { timeout: 60000 });
                        const links = await page.$$eval('div.g a', as => as.map(a => a.href));
                        
                        for (const link of links) {
                            if (link.includes(url)) {
                                console.log(`URL ${url} found at rank #${rank} for keyword "${keyword}".`);
                                await updateTrafficDataRank(userId, rank);
                                found = true;
                                break;
                            }
                            rank++;
                        }

                        if (found) break;
                        
                        const nextButton = await page.$('a#pnnext');
                        if (nextButton) {
                            await Promise.all([
                                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
                                nextButton.click(),
                            ]);
                        } else {
                            break;
                        }
                    }

                    if (!found) {
                        console.log(`URL ${url} not found in the first 10 pages of Google search results for keyword "${keyword}".`);
                    }

                    return found;
                } catch (err) {
                    console.error(`Error during Google search: ${err.message}`);
                    throw err;
                }
            };

            const bots = [];
            for (let i = 0; i < numBots; i++) {
                bots.push(new Promise(async (resolve) => {
                    const page = await browser.newPage();
                    try {
                        const found = await searchKeywordOnGoogle(page, keyword, url);
                        if (found) {
                            console.log(`Bot ${i + 1} found the URL.`);
                        } else {
                            console.log(`Bot ${i + 1} did not find the URL.`);
                        }
                    } catch (err) {
                        console.error(`Error in bot ${i + 1}: ${err.message}`);
                    } finally {
                        await page.close();
                        resolve();
                    }
                }));
            }

            await Promise.all(bots);
        } catch (err) {
            console.error(`Error generating traffic inside Puppeteer: ${err.message}`);
            throw err;
        } finally {
            if (browser) await browser.close();
        }
    };
};

const findWebsiteByKeyword = async ({ url, keyword, userId }) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--proxy-server=p.webshare.io:80'
            ]
        });

        const searchKeywordOnGoogle = async (page, keyword, url) => {
            try {
                await page.authenticate({ username: 'iqginjvo-rotate', password: 'a2rgiep0kllk' });
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
                await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

                // Check for reCAPTCHA and handle if found
                if (await page.$('.g-recaptcha')) {
                    console.error(`reCAPTCHA found on Google search page. Skipping bot.`);
                    return false; // Skip the bot if reCAPTCHA found
                }

                let found = false;
                let rank = 1;

                for (let i = 0; i < 10; i++) {
                    await page.waitForSelector('div.g a', { timeout: 60000 });
                    const links = await page.$$eval('div.g a', as => as.map(a => a.href));
                    
                    for (const link of links) {
                        if (link.includes(url)) {
                            console.log(`URL ${url} found at rank #${rank} for keyword "${keyword}".`);
                            await updateTrafficDataRank(userId, rank);
                            found = true;
                            break;
                        }
                        rank++;
                    }

                    if (found) break;
                    
                    const nextButton = await page.$('a#pnnext');
                    if (nextButton) {
                        await Promise.all([
                            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
                            nextButton.click(),
                        ]);
                    } else {
                        break;
                    }
                }

                if (!found) {
                    console.log(`URL ${url} not found in the first 10 pages of Google search results for keyword "${keyword}".`);
                }

                return found;
            } catch (err) {
                console.error(`Error during Google search: ${err.message}`);
                throw err;
            }
        };

        const page = await browser.newPage();
        const found = await searchKeywordOnGoogle(page, keyword, url);
        await page.close();

        return found;
    } catch (err) {
        console.error(`Error finding website by keyword inside Puppeteer: ${err.message}`);
        throw err;
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = { generateTraffic, findWebsiteByKeyword };
