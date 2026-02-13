const ExpenseModel = require('../models/expenseModel');

const summaryController = {
    getSummary: async (req, res) => {
        try {
            console.log('📊 Fetching summary data...');
            
            const summaryData = await ExpenseModel.getSummary();
            
            console.log('✅ Summary data fetched:', summaryData);
            
            res.json({ 
                success: true, 
                data: summaryData 
            });
        } catch (error) {
            console.error('❌ Error in getSummary:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching summary: ' + error.message 
            });
        }
    }
};

module.exports = summaryController;