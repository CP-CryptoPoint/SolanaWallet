// 配置信息
const CONFIG = {
    // Solana 网络连接配置
    RPC_URL: process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
    WALLET_FOLDER: "./wallets",  // 钱包文件存储目录
    WALLET_FILE_PREFIX: "wallet_", // 钱包文件名前缀
};

export default CONFIG;