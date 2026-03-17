const db =require('../db') 

const donationService = {
    // ========================
    // 1. חישובי Dashboard (ניהול כללי) - תמיכה ב-Pagination
    // ========================
 calculateDashboardStats: async (filters = {}) => {
    try {
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 10;
        const offset = (page - 1) * limit;

        // 1. בניית תנאי הסינון הדינמי
        let whereClause = ' WHERE 1=1';
        const queryParams = [];

        if (filters.branch && filters.branch !== 'all') {
            whereClause += ' AND b.name = ?';
            queryParams.push(filters.branch);
        }
        
        if (filters.startDate && filters.endDate) {
            whereClause += ' AND d.donation_date BETWEEN ? AND ?';
            queryParams.push(filters.startDate, filters.endDate);
        }

        if (filters.search) {
            whereClause += ' AND (d.id LIKE ? OR b.name LIKE ?)';
            const searchVal = `%${filters.search}%`;
            queryParams.push(searchVal, searchVal);
        }

        // 2. חישוב נתונים לחודש הקודם (בשביל ההשוואה)
        const lastMonthQuery = `
            SELECT SUM(amount) as total, COUNT(id) as count 
            FROM donations 
            WHERE donation_date >= DATE_SUB(DATE_FORMAT(CURDATE() ,'%Y-%m-01'), INTERVAL 1 MONTH)
            AND donation_date < DATE_FORMAT(CURDATE() ,'%Y-%m-01')
        `;
        const [lastMonthRows] = await db.query(lastMonthQuery);
        const lastMonthTotal = parseFloat(lastMonthRows[0].total) || 0;

        // 3. שליפת סטטיסטיקות נוכחיות (לפי הפילטרים)
        const statsQuery = `
            SELECT SUM(d.amount) AS totalAmount, COUNT(d.id) AS totalDonations 
            FROM donations d
            LEFT JOIN branches b ON d.branch_id = b.id
            ${whereClause}
        `;
        const [totalRows] = await db.query(statsQuery, queryParams);
        const totalAmount = parseFloat(totalRows[0].totalAmount) || 0;
        const totalDonations = totalRows[0].totalDonations || 0;

        // חישוב אחוז השינוי
        const diff = lastMonthTotal === 0 ? 100 : ((totalAmount - lastMonthTotal) / lastMonthTotal) * 100;
        const isPositive = diff >= 0;
        const changeText = `${isPositive ? '+' : ''}${diff.toFixed(1)}% מחודש שעבר`;

        // 4. פילוח סניפים
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

        // 5. רשימת עסקאות
    
let transactionsQuery = `
    SELECT d.id, b.name AS branch, d.donation_date AS date, d.amount, d.status, 
           d.is_recurring, d.months_count
    FROM donations d
    LEFT JOIN branches b ON d.branch_id = b.id
    ${whereClause}
    ORDER BY d.donation_date DESC, d.id DESC LIMIT ? OFFSET ?
`;


        const [recentTransactions] = await db.query(transactionsQuery, [...queryParams, limit, offset]);

        // 6. סיכום יומי
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
                id: t.id,
                branch: t.branch || 'כללי',
                date: new Date(t.date).toLocaleDateString('he-IL'),
                amount: parseFloat(t.amount) || 0,
                status: t.status || 'completed'
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
   
    filterTransactions: async (filters) => {
        try {
            let query = `
                SELECT d.*, b.name AS branch, t.name AS target, m.name AS method
                FROM donations d
                LEFT JOIN branches b ON d.branch_id = b.id
                LEFT JOIN targets t ON d.target_id = t.id
                LEFT JOIN methods m ON d.method_id = m.id
                WHERE 1=1
            `;
            const params = [];

            // סינון לפי סניף
            if (filters.branchId && filters.branchId !== 'all') {
                query += ' AND d.branch_id = ?';
                params.push(filters.branchId);
            }
            // סינון לפי יעד (קרן)
            if (filters.targetId && filters.targetId !== 'all') {
                query += ' AND d.target_id = ?';
                params.push(filters.targetId);
            }
            // סינון לפי טווח תאריכים
            if (filters.startDate && filters.endDate) {
                query += ' AND d.donation_date BETWEEN ? AND ?';
                params.push(filters.startDate, filters.endDate);
            }
            // סינון לפי סכום מדויק
            if (filters.amount) {
                query += ' AND d.amount = ?';
                params.push(filters.amount);
            }
            // סינון לפי אמצעי תשלום
            if (filters.methodId) {
                query += ' AND d.method_id = ?';
                params.push(filters.methodId);
            }

            query += ' ORDER BY d.donation_date DESC';
            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // 2. עדכון תרומה קיימת
    updateDonation: async (id, data) => {
        const query = `
            UPDATE donations 
            SET amount = ?, target_id = ?, method_id = ?, branch_id = ?, donation_date = ?, notes = ?
            WHERE id = ?
        `;
        const params = [data.amount, data.target_id, data.method_id, data.branch_id, data.donation_date, data.notes, id];
        await db.query(query, params);
        return { id, ...data };
    },


    // ========================
    // 2. שליפת תרומות עם סינון ועימוד
    // ========================
    filterTransactions: async (filters) => {
        try {
            const page = parseInt(filters.page) || 1;
            const limit = parseInt(filters.limit) || 20;
            const offset = (page - 1) * limit;

            let query = `
                SELECT d.id, b.name AS branch, d.amount, d.donation_date AS date, 
                        t.name AS target, m.name AS method, d.status
                FROM donations d
                LEFT JOIN branches b ON d.branch_id = b.id
                LEFT JOIN targets t ON d.target_id = t.id
                LEFT JOIN methods m ON d.method_id = m.id
                WHERE 1=1
            `;
            const params = [];

            if (filters.branch && filters.branch !== 'all') {
                query += ' AND b.name = ?';
                params.push(filters.branch);
            }
            if (filters.search) {
                query += ' AND d.id LIKE ?';
                params.push(`%${filters.search}%`);
            }

            query += ' ORDER BY d.donation_date DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            console.error("Service Error (filterTransactions):", error);
            throw error;
        }
    },

    // ========================
    // 3. פונקציות סניף
    // ========================
    getTodayDonations: async (branchId) => {
        try {
            const query = `
                SELECT * FROM donations 
                WHERE branch_id = ? AND DATE(donation_date) = CURDATE()
                ORDER BY created_at DESC
            `;
            const [rows] = await db.query(query, [branchId]);
            return rows;
        } catch (error) {
            console.error("Service Error (getTodayDonations):", error);
            throw error;
        }
    },

    createDonation: async (data) => {
    try {
        // הוספת תמיכה בשני הפורמטים (CamelCase ו-SnakeCase)
        const amount = data.amount;
        const notes = data.notes;
        const is_recurring = data.is_recurring !== undefined ? data.is_recurring : (data.isRecurring ? 1 : 0);
        const months_count = data.months_count || data.installments || 1;
        
        const branch_id = data.branchId || data.branch_id;
        const target_id = data.targetId || data.target_id;
        const method_id = data.methodId || data.method_id;
        const created_by = data.userId || data.created_by; 

        const query = `
            INSERT INTO donations 
            (amount, target_id, method_id, branch_id, donation_date, status, notes, created_by, is_recurring, months_count, created_at) 
            VALUES (?, ?, ?, ?, CURDATE(), 'completed', ?, ?, ?, ?, NOW())
        `;
        
        const [result] = await db.query(query, [
            amount, target_id, method_id, branch_id, notes, created_by, 
            is_recurring, 
            months_count
        ]);
        return { id: result.insertId, ...data };
    } catch (error) {
        console.error("SQL Error:", error);
        throw error;
    }
},

    updateDonation: async (id, data) => {
        try {
            const target_id = data.target_id || data.targetId;
            const method_id = data.method_id || data.methodId;

            const query = `
                UPDATE donations 
                SET amount = ?, target_id = ?, method_id = ?, notes = ?
                WHERE id = ?
            `;
            await db.query(query, [data.amount, target_id, method_id, data.notes, id]);
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
    
};

module.exports = donationService;