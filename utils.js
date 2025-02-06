import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import fs from "fs/promises";
import { Buffer } from 'buffer';
import CONFIG from './config.js';
import path from 'path';

// 创建钱包相关函数
async function createWallet(walletName = '') {
    try {
        // 确保钱包目录存在
        await ensureWalletDirectory();

        // 生成新的密钥对
        const wallet = Keypair.generate();
        const publicKey = wallet.publicKey.toBase58();
        const secretKey = wallet.secretKey;
        const secretKeyBase64 = Buffer.from(secretKey).toString("base64");

        // 生成钱包文件名
        const fileName = walletName || 
            `${CONFIG.WALLET_FILE_PREFIX}${publicKey.slice(0, 8)}.json`;
        const filePath = path.join(CONFIG.WALLET_FOLDER, fileName);

        // 构建钱包数据
        const walletData = {
            publicKey,
            secretKeyBase64,
            createdAt: new Date().toISOString(),
            network: CONFIG.RPC_URL
        };

        // 将钱包信息保存到文件
        await fs.writeFile(
            filePath,
            JSON.stringify(walletData, null, 2)
        );

        // 打印钱包信息
        console.log("\n=== 钱包创建成功 ===");
        console.log("钱包文件:", fileName);
        console.log("钱包公钥:", publicKey);
        console.log("钱包私钥(base64):", secretKeyBase64);

        // 获取并显示余额
        const balance = await getWalletBalance(publicKey);
        console.log("钱包余额:", balance, "SOL");

        return {
            publicKey,
            secretKey,
            secretKeyBase64,
            balance,
            filePath
        };
    } catch (error) {
        console.error("创建钱包失败:", error.message);
        throw error;
    }
}

// 导入钱包函数
async function importWallet(walletPath) {
    try {
        // 检查文件是否存在
        if (!await fileExists(walletPath)) {
            throw new Error(`钱包文件不存在: ${walletPath}`);
        }

        // 读取钱包文件
        const walletData = JSON.parse(
            await fs.readFile(walletPath, 'utf8')
        );

        // 从base64还原私钥
        const secretKey = Buffer.from(walletData.secretKeyBase64, 'base64');
        
        // 使用私钥创建钱包
        const wallet = Keypair.fromSecretKey(secretKey);
        const publicKey = wallet.publicKey.toString();

        // 验证公钥匹配
        if (publicKey !== walletData.publicKey) {
            throw new Error('钱包公钥验证失败');
        }

        // 获取最新余额
        const balance = await getWalletBalance(publicKey);

        console.log("\n=== 钱包导入成功 ===");
        console.log("钱包公钥:", publicKey);
        console.log("创建时间:", walletData.createdAt);
        console.log("当前余额:", balance, "SOL");

        return {
            publicKey,
            secretKey,
            balance,
            createdAt: walletData.createdAt
        };
    } catch (error) {
        console.error("导入钱包失败:", error.message);
        throw error;
    }
}

// 获取钱包余额
async function getWalletBalance(publicKey) {
    try {
        const connection = new Connection(CONFIG.RPC_URL);
        const pubKey = new PublicKey(publicKey);
        const balance = await connection.getBalance(pubKey);
        return balance / LAMPORTS_PER_SOL;
    } catch (error) {
        console.error("获取余额失败:", error.message);
        return 0;
    }
}

// 列出所有钱包
async function listWallets() {
    try {
        await ensureWalletDirectory();
        const files = await fs.readdir(CONFIG.WALLET_FOLDER);
        const wallets = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(CONFIG.WALLET_FOLDER, file);
                const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
                const balance = await getWalletBalance(data.publicKey);
                wallets.push({
                    name: file,
                    publicKey: data.publicKey,
                    balance,
                    createdAt: data.createdAt
                });
            }
        }

        console.log("\n=== 钱包列表 ===");
        wallets.forEach((wallet, index) => {
            console.log(`\n${index + 1}. ${wallet.name}`);
            console.log("   公钥:", wallet.publicKey);
            console.log("   余额:", wallet.balance, "SOL");
            console.log("   创建时间:", wallet.createdAt);
        });

        return wallets;
    } catch (error) {
        console.error("获取钱包列表失败:", error.message);
        return [];
    }
}

// 确保钱包目录存在
async function ensureWalletDirectory() {
    try {
        await fs.access(CONFIG.WALLET_FOLDER);
    } catch {
        await fs.mkdir(CONFIG.WALLET_FOLDER, { recursive: true });
    }
}

// 检查文件是否存在
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}


// 导出函数供其他模块使用
export {
    createWallet,
    importWallet,
    listWallets,
    getWalletBalance
};
