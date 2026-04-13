const db = require('../db')

const donationService = {
    // ========================
    // 1. חישובי Dashboard (ניהול כללי)
    // ========================
    calculateDashboardStats: async (filters = {}) => {
        try {
            const page = parseInt(filters.page) || 1;
            const limit = parseInt(filters.limit) || 10;
            const offset = (page - 1) * limit;

            let whereClause = ' WHERE 1=1';
            const queryParams = [];

            if (filters.branch && filters.branch !== 'all') {
                whereClause += ' AND b.name = ?';
                queryParams.push(filters.branch);
            }

            if (filters.startDate && filters.endDate && filters.startDate !== '' && filters.endDate !== '') {
                whereClause += ' AND d.donation_date BETWEEN ? AND ?';
                queryParams.push(filters.startDate, filters.endDate);
            }

            if (filters.search) {
                whereClause += ' AND (d.id LIKE ? OR b.name LIKE ? OR d.worker_name LIKE ?)';
                const searchVal = `%${filters.search}%`;
                queryParams.push(searchVal, searchVal, searchVal); // הוספת הפרמטר השלישי
            }

            const lastMonthQuery = `
                SELECT SUM(amount) as total, COUNT(id) as count 
                FROM donations 
                WHERE donation_date >= DATE_SUB(DATE_FORMAT(CURDATE() ,'%Y-%m-01'), INTERVAL 1 MONTH)
                AND donation_date < DATE_FORMAT(CURDATE() ,'%Y-%m-01')
            `;
            const [lastMonthRows] = await db.query(lastMonthQuery);
            const lastMonthTotal = parseFloat(lastMonthRows[0].total) || 0;

            const statsQuery = `
                SELECT SUM(d.amount) AS totalAmount, COUNT(d.id) AS totalDonations 
                FROM donations d
                LEFT JOIN branches b ON d.branch_id = b.id
                ${whereClause}
            `;
            const [totalRows] = await db.query(statsQuery, queryParams);
            const totalAmount = parseFloat(totalRows[0].totalAmount) || 0;
            const totalDonations = totalRows[0].totalDonations || 0;

            const diff = lastMonthTotal === 0 ? 100 : ((totalAmount - lastMonthTotal) / lastMonthTotal) * 100;
            const isPositive = diff >= 0;
            const changeText = `${isPositive ? '+' : ''}${diff.toFixed(1)}% מחודש שעבר`;

            const branchDataQuery = `
                SELECT 
                    b.name, 
                    COALESCE(SUM(CASE WHEN 1=1 ${whereClause.replace('WHERE 1=1', '')} THEN d.amount ELSE 0 END), 0) as branchTotal
                FROM branches b
                LEFT JOIN donations d ON b.id = d.branch_id
                GROUP BY b.id, b.name
            `;
            const [branchData] = await db.query(branchDataQuery, [...queryParams]);

            const branchSummary = branchData.map(branch => {
                const bTotal = parseFloat(branch.branchTotal) || 0;
                return {
                    name: branch.name,
                    amount: bTotal,
                    percentage: totalAmount > 0 ? Math.round((bTotal / totalAmount) * 100) : 0
                };
            });

            let transactionsQuery = `
    SELECT d.id, b.name AS branch, d.donation_date AS date, d.amount, d.status, 
           d.is_recurring AS isRecurring, d.months_count AS installments,
           d.method_id AS methodId, d.target_id AS targetId,
           d.fund_number AS fundNumber, d.target_other_note AS targetOtherNote,worker_name AS workerName
    FROM donations d
    LEFT JOIN branches b ON d.branch_id = b.id
    ${whereClause}
    ORDER BY d.donation_date DESC, d.id DESC LIMIT ? OFFSET ?
`;

            const [recentTransactions] = await db.query(transactionsQuery, [...queryParams, limit, offset]);

            const [todayBranchData] = await db.query(`
                SELECT b.name, COALESCE(SUM(d.amount), 0) as amount, COUNT(d.id) as count
                FROM branches b
                LEFT JOIN donations d ON b.id = d.branch_id AND DATE(d.donation_date) = CURDATE()
                GROUP BY b.id, b.name
            `);

            return {
                stats: [
                    { title: 'סה"כ תרומות', value: `₪${totalAmount.toLocaleString()}`, change: changeText, isPositive: isPositive },
                    { title: 'מספר תרומות', value: totalDonations.toString(), change: 'מעודכן', isPositive: true },
                    { title: 'ממוצע לתרומה', value: `₪${totalDonations > 0 ? (totalAmount / totalDonations).toFixed(2) : 0}`, change: 'מעודכן', isPositive: true }
                ],
                todaySummary: {
                    total: todayBranchData.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0),
                    branches: todayBranchData.map(b => ({
                        name: b.name,
                        amount: parseFloat(b.amount) || 0,
                        count: b.count || 0
                    }))
                },
                branchSummary,
                transactions: recentTransactions.map(t => ({
                    ...t,
                    date: new Date(t.date).toLocaleDateString('he-IL'),
                    amount: parseFloat(t.amount) || 0,
                    isRecurring: t.isRecurring === 1 || t.isRecurring === true
                })),
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalDonations / limit)
                }
            };
        } catch (error) {
            console.error("Service Error:", error);
            throw error;
        }
    },

    // ========================
    // 2. שליפת תרומות (סניף) - הפונקציה הבעייתית שתוקנה
    // ========================
    getTodayDonations: async (branchId) => {
        try {
            // הוספת Aliases כדי להתאים ל-Frontend



            const query = `
            SELECT 
                id, amount, donation_date AS date, 
                target_id AS targetId, method_id AS methodId, 
                fund_number AS fundNumber, target_other_note AS targetOtherNote,
                is_recurring AS isRecurring, months_count AS installments,
                status, notes
            FROM donations 
            WHERE branch_id = ? AND DATE(donation_date) = CURDATE()
            ORDER BY created_at DESC
        `;

            const [rows] = await db.query(query, [branchId]);

            // המרה נוספת ליתר ביטחון (טיפול בבוליאני)
            return rows.map(r => ({
                ...r,
                isRecurring: r.isRecurring === 1
            }));
        } catch (error) {
            console.error("Service Error (getTodayDonations):", error);
            throw error;
        }
    },

    // ========================
    // 3. יצירה ועדכון
    // ========================
    createDonation: async (data) => {
        try {
            const amount = data.amount;
            const notes = data.notes;

            const fund_number = data.fundNumber || data.fund_number || null;
            const target_other_note = data.targetOtherNote || data.target_other_note || null;

            const is_recurring = data.isRecurring !== undefined ? (data.isRecurring ? 1 : 0) : (data.is_recurring || 0);
            const months_count = data.installments || data.months_count || 1;

            const branch_id = data.branchId || data.branch_id;
            const target_id = data.targetId || data.target_id;
            const method_id = data.methodId || data.method_id;
            const worker_name = data.workerName || data.worker_name;
            const created_by = data.userId || data.created_by;
            const query = `
                INSERT INTO donations 
                (amount, target_id, fund_number, target_other_note, method_id, worker_name, branch_id, donation_date, status, notes, created_by, is_recurring, months_count, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), 'completed', ?, ?, ?, ?, NOW())
            `;

            const [result] = await db.query(query, [
                amount, target_id, fund_number, target_other_note, method_id,
                worker_name, branch_id, notes, created_by, is_recurring, months_count
            ]);


            return { id: result.insertId, ...data };
        } catch (error) {
            console.error("SQL Error:", error);
            throw error;
        }
    },

    deleteDonation: async (id) => {
        try {
            await db.query('DELETE FROM donations WHERE id = ?', [id]);
        } catch (error) {
            console.error("Service Error (deleteDonation):", error);
            throw error;
        }
    },

    updateDonation: async (id, data) => {
        try {
            // חילוץ ומיפוי שדות (תמיכה גם ב-CamelCase מה-Frontend וגם ב-SnakeCase)
            const target_id = data.targetId || data.target_id;
            const method_id = data.methodId || data.method_id;
            const branch_id = data.branchId || data.branch_id;
            const worker_name = data.workerName || data.worker_name;

            const fund_number = data.fundNumber || data.fund_number || null;
            const target_other_note = data.targetOtherNote || data.target_other_note || null;

            const is_recurring = data.isRecurring !== undefined ? (data.isRecurring ? 1 : 0) : (data.is_recurring || 0);
            const months_count = data.installments || data.months_count || 1;
            const amount = data.amount;
            const notes = data.notes || null;

            const query = `
                UPDATE donations 
                SET amount = ?, target_id = ?, fund_number = ?, target_other_note = ?, 
                    method_id = ?, worker_name = ?, branch_id = ?, notes = ?, 
                    is_recurring = ?, months_count = ?
                WHERE id = ?
            `;

            await db.query(query, [
                amount, target_id, fund_number, target_other_note, method_id,
                worker_name, branch_id, notes, is_recurring, months_count, id
            ]);

            return { id, ...data };
        } catch (error) {
            console.error("Service Error (updateDonation):", error);
            throw error;
        }
    },
    getBranches: async () => {
        const [rows] = await db.query('SELECT id, name FROM branches ORDER BY name ASC');
        return rows;
    },

    getAmountDonationCash: async (branchId) => {
        const query = `
            SELECT SUM(amount) AS totalCash 
            FROM donations 
            WHERE branch_id = ? AND method_id = 1 AND DATE(donation_date) = CURDATE()
        `;
        const [rows] = await db.query(query, [branchId]);
        return parseFloat(rows[0].totalCash) || 0;
    }
}

module.exports = donationService;