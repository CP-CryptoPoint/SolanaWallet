import {
    createWallet,
    listWallets,
    importWallet,
} from './utils.js';
import path from 'path';

// 示例使用
async function main() {
    try {
        // 创建新钱包
        await createWallet();

        // 列出所有钱包
        const wallets = await listWallets();

        // 如果有钱包，尝试导入第一个钱包
        if (wallets.length > 0) {
            const walletPath = path.join(CONFIG.WALLET_FOLDER, wallets[0].name);
            await importWallet(walletPath);
        }
    } catch (error) {
        console.error("程序执行失败:", error.message);
    }
}

// 如果直接运行此文件，则执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
} 


// process.removeAllListeners('warning');
// process.on('warning', e => {
//     if (e.name === 'DeprecationWarning' && e.message.includes('punycode')) {
//         return;
//     }
//     console.warn(e.stack);
// });