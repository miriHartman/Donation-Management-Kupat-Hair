// Backend: donationController.js

const donationService = require('../services/donationService');

const donationController = {
    // 1. שליפת סטטיסטיקות כלליות - מעודכן לקבלת query params
    getStats: async (req, res) => {
        try {
            // התיקון כאן: מעבירים את req.query (שמכיל את ה-page) ל-Service
            const stats = await donationService.calculateDashboardStats(req.query);
            res.json(stats);
        } catch (error) {
            console.error("Controller Error (getStats):", error);
            res.status(500).json({ message: "שגיאה בשליפת הסטטיסטיקה" });
        }
    },

    // 2. שליפת רשימת עסקאות עם פילטרים
    getTransactions: async (req, res) => {
        try {
            const filters = req.query; 
            const result = await donationService.filterTransactions(filters);
            res.json(result);
        } catch (error) {
            console.error("Controller Error (getTransactions):", error);
            res.status(500).json({ message: "שגיאה בשליפת העסקאות" });
        }
    },

    // 3. שליפת תרומות היום של סניף ספציפי
    getTodayDonations: async (req, res) => {
        try {
            const { branchId } = req.params;
            const donations = await donationService.getTodayDonations(branchId);
            res.json(donations);
        } catch (error) {
            console.error("Controller Error (getTodayDonations):", error);
            res.status(500).json({ message: "שגיאה בשליפת תרומות היום" });
        }
    },

    // 4. יצירת תרומה חדשה
    createDonation: async (req, res) => {
        try {
            const data = req.body;
            const userId = req.user ? req.user.id : data.userId; 

            const donationToSave = {
                ...data,
                created_by: userId
            };

            const newDonation = await donationService.createDonation(donationToSave);
            res.status(201).json(newDonation);
        } catch (error) {
            console.error("Controller Error:", error);
            res.status(500).json({ message: "שגיאה בשמירה" });
        }
    },

    // 5. עדכון תרומה קיימת
    updateDonation: async (req, res) => {
        try {
            const { id } = req.params;
            const updated = await donationService.updateDonation(id, req.body);
            res.json(updated);
        } catch (error) {
            console.error("Controller Error (updateDonation):", error);
            res.status(500).json({ message: "שגיאה בעדכון התרומה" });
        }
    },
    // 6. מחיקת תרומה
    deleteDonation: async (req, res) => {
        try {
            const { id } = req.params;
            const success = await donationService.deleteDonation(id);
            
            if (!success) {
                return res.status(404).json({ message: "התרומה לא נמצאה או שכבר נמחקה" });
            }
            
            res.json({ message: "התרומה נמחקה בהצלחה" });
        } catch (error) {
            console.error("❌ Controller Error (deleteDonation):", error.message);
            res.status(500).json({ 
                message: "שגיאה במחיקת התרומה", 
                error: error.message 
            });
        }
    },
// 8. שליפת סכום התרומות במזומן של היום לסניף מסוים
    getAmountDonationCash: async (req, res) => {
        try {
            const { branchId } = req.params;
            const totalCash = await donationService.getAmountDonationCash(branchId);
            res.json({ totalCash });
        } catch (error) {
            console.error("Controller Error (getAmountDonationCash):", error);
            res.status(500).json({ message: "שגיאה בשליפת סכום התרומות במזומן" });
        }
},

 getFundsDonations: async (req, res) => {
        try {
            const fundsDonations = await donationService.getFundsDonations();
            res.json(fundsDonations);
        } catch (error) {
            console.error("Controller Error (getFundsDonations):", error);
            res.status(500).json({ message: "שגיאה בשליפת תרומות הקרנות" });
        }}};


module.exports = donationController;