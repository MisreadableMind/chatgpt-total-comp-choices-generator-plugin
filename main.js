const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Use the cors middleware to enable CORS
app.use(cors({
    origin: [
        `http://localhost:${PORT}`,
        'https://chat.openai.com'
    ]
}));


const generateTotalCompChoices = (optionPoolSizePercent, optionsLockedForAdvisorsOutOfPoolInPercentage,
                                  totalCompanySharesCount, currentCompanyValuationInMillions, baseAnnualSalaryInUSD) => {
    const optionPoolSize = optionPoolSizePercent / 100 * totalCompanySharesCount;

    const optionsLockedForAdvisors = optionsLockedForAdvisorsOutOfPoolInPercentage / 100 * optionPoolSize;

    const optionsAvailableForEmployees = optionPoolSize - optionsLockedForAdvisors;

    const minSalary = baseAnnualSalaryInUSD * 0.8;
    const maxSalary = baseAnnualSalaryInUSD * 1.2;

    const lowerCashBiggerOptionGrossSalary = minSalary;
    const lowerCashBiggerOptionOptionsCount = Math.floor(optionsAvailableForEmployees * 0.065);
    const lowerCashBiggerOptionInCompanyCapital = lowerCashBiggerOptionOptionsCount / totalCompanySharesCount * 100;

    const balancedCashBalancedOptionGrossSalary = baseAnnualSalaryInUSD;
    const balancedCashBalancedOptionOptionsCount = Math.floor(optionsAvailableForEmployees * 0.050);
    const balancedCashBalancedOptionInCompanyCapital = balancedCashBalancedOptionOptionsCount / totalCompanySharesCount * 100;

    const biggerCashLowerOptionsGrossSalary = maxSalary;
    const biggerCashLowerOptionsOptionsCount = Math.floor(optionsAvailableForEmployees * 0.035);
    const biggerCashLowerOptionsInCompanyCapital = biggerCashLowerOptionsOptionsCount / totalCompanySharesCount * 100;

    return [{
        "name": "Lower Cash, Bigger Options",
        "salary": lowerCashBiggerOptionGrossSalary,
        "options": lowerCashBiggerOptionOptionsCount,
        "options_percent_in_company_capital": lowerCashBiggerOptionInCompanyCapital
    }, {
        "name": "Balanced Cash, Balanced Options",
        "salary": balancedCashBalancedOptionGrossSalary,
        "options": balancedCashBalancedOptionOptionsCount,
        "options_percent_in_company_capital": balancedCashBalancedOptionInCompanyCapital
    }, {
        "name": "Bigger Cash, Lower Options",
        "salary": biggerCashLowerOptionsGrossSalary,
        "options": biggerCashLowerOptionsOptionsCount,
        "options_percent_in_company_capital": biggerCashLowerOptionsInCompanyCapital
    }];
};


// Add a route to add a todo for a specific user
app.post('/totalCompChoices', (req, res) => {
    const {
        option_pool_size_percent,
        options_locked_for_advisors_out_of_pool_in_percentage,
        total_company_shares_count,
        current_company_valuation_in_millions,
        base_annual_salary_in_usd
    } = req.body;

    const totalCompChoices = generateTotalCompChoices(option_pool_size_percent,
        options_locked_for_advisors_out_of_pool_in_percentage,
        total_company_shares_count,
        current_company_valuation_in_millions,
        base_annual_salary_in_usd);

    res.json({ choices: totalCompChoices });
});

// Add a route to serve the plugin logo
app.get('/logo.png', (req, res) => {
    const filename = 'logo.png';
    res.type('png').sendFile(filename);
});

// Add a route to serve the plugin manifest
app.get('/.well-known/ai-plugin.json', (req, res) => {
    const host = req.headers.host;
    const text = fs.readFileSync('manifest.json', 'utf8').replace('PLUGIN_HOSTNAME', `https://${host}`);
    res.type('json').send(text);
});

// Add a route to serve the OpenAPI spec
app.get('/openapi.yaml', (req, res) => {
    const host = req.headers.host;
    const text = fs.readFileSync('openapi.yaml', 'utf8').replace('PLUGIN_HOSTNAME', `https://${host}`);
    res.type('yaml').send(text);
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
