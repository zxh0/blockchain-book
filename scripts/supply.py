import matplotlib.pyplot as plt
import numpy as np
import datetime

# --- 参数设定 ---
INITIAL_BLOCK_REWARD = 50  # 初始区块奖励 (BTC)
HALVING_INTERVAL = 210000    # 减半周期 (区块数)
BLOCKS_PER_YEAR = 6 * 24 * 365 # 大约每年产生的区块数 (6个/小时 * 24小时 * 365天)
START_DATE = datetime.date(2009, 1, 3) # 比特币创世区块日期

# --- 数据计算 ---
total_supply = 0
current_reward = INITIAL_BLOCK_REWARD
block_number = 0

# 存储历史数据用于绘图
dates = []
supply_history = []

# 模拟计算直到奖励变得非常小 (接近于0)
# 比特币协议使用整数运算，奖励最终会变为0
while current_reward > 0:
    # 计算下一次减半需要的年数
    years_to_next_halving = HALVING_INTERVAL / BLOCKS_PER_YEAR
    
    # 在当前奖励周期内，每年增加的供应量
    for i in range(int(np.ceil(years_to_next_halving))):
        # 如果已经模拟了超过200年，则跳出循环，避免图像过于拉长
        if len(dates) > 200:
            break

        current_date = START_DATE + datetime.timedelta(days=int((len(dates)) * 365.25))
        dates.append(current_date)
        
        # 计算并增加当年的供应量
        supply_increase_this_year = BLOCKS_PER_YEAR * current_reward
        total_supply += supply_increase_this_year
        
        # 限制总量不超过2100万
        if total_supply > 21000000:
            total_supply = 21000000
            
        supply_history.append(total_supply)

        block_number += BLOCKS_PER_YEAR
        # 检查是否需要减半
        if block_number // HALVING_INTERVAL > (block_number - BLOCKS_PER_YEAR) // HALVING_INTERVAL:
            break
            
    # 奖励减半
    current_reward /= 2

# 确保最后一个点是2100万
if supply_history[-1] < 21000000:
    dates.append(dates[-1] + datetime.timedelta(days=365*4)) # 象征性地增加一个未来的日期
    supply_history.append(21000000)


# --- 绘图 ---
plt.style.use('seaborn-v0_8-darkgrid') # 使用一个好看的样式
fig, ax = plt.subplots(figsize=(12, 8))

# 绘制供应量曲线
ax.plot(dates, [s / 1000000 for s in supply_history], label="Total Qcoin Supply", color='orange', linewidth=2) # 比特币总供应量

# 设置图表标题和标签
ax.set_title("Total Qcoin Supply Over Time", fontsize=18, fontweight='bold') # 比特币总发行量随时间变化曲线
ax.set_xlabel("Year", fontsize=12) # 年份
ax.set_ylabel("Total Supply (in Millions Qcoin)", fontsize=12) # 总发行量 (百万 BTC)

# 设置Y轴，最高到2100万
ax.set_ylim(0, 21.5)
ax.axhline(y=21, linestyle='--', color='gray', label='21 Million Cap') # 添加2100万的水平线，2100万枚上限

# 格式化日期显示
from matplotlib.dates import DateFormatter
date_form = DateFormatter("%Y")
ax.xaxis.set_major_formatter(date_form)
fig.autofmt_xdate() # 自动旋转日期标签

# 添加图例
ax.legend(fontsize=12)

# 显示网格
ax.grid(True)

# 显示图表
plt.tight_layout()
plt.show()