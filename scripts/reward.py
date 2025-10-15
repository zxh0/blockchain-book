reward = 50 * (10 **8)
supply = 0
i = 1

while reward > 0:
    supply += 210000 * reward
    print(i, reward, supply)
    reward = reward // 2  # 使用整数除法确保结果为整数
    i += 1
