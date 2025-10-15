let reward = 50n * 10n ** 8n;
let supply = 0n;
let i = 1;

while (reward > 0) {
  supply += 210000n * reward;
  console.log(i, reward, supply);
  reward /= 2n;
  i++;
}
