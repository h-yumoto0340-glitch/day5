const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const db = new Database("votes.db");

// テーブルの自動作成
db.prepare("CREATE TABLE IF NOT EXISTS votes (id INTEGER PRIMARY KEY AUTOINCREMENT, option_name TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)").run();

app.use(express.json());
// 静的ファイルの配信 (index.html など)
app.use(express.static(__dirname));

// 投票受け取り
app.post("/vote", (req, res) => {
    const { option } = req.body;
    if (!option) {
        return res.status(400).json({ error: "Option is required" });
    }

    const info = db.prepare("INSERT INTO votes (option_name) VALUES (?)").run(option);
    res.json({ success: true, id: info.lastInsertRowid });
});

// 集計結果を返す
app.get("/votes", (req, res) => {
    const rows = db.prepare("SELECT option_name as \"option\", COUNT(*) as count FROM votes GROUP BY option_name").all();
    res.json(rows);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
