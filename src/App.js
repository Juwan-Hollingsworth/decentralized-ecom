import { useEffect, useState } from "react";
import { ethers } from "ethers";

import Navigation from "./components/Navigation";

// import smart contract ABI 
import Ethcommerce from "./abis/Ethcommerce.json";

// import network config 
import config from "./config.json";

function App() {

  // state var to manage blockchain data 
  const [provider, setProvider] = useState(null);
  const [ethcommerce, setEthcommerce] = useState(null);
// state vars for different product categories 
  const [electronics, setElectronics] = useState(null);
  const [clothing, setClothing] = useState(null);
  const [toys, setToys] = useState(null);

  // state var for user's wallet address 
  const [account, setAccount] = useState(null);

  // fx to init blockchain connection and load data 
  const loadBlockchainData = async () => {

    // create a new provider using metmask 
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);
    // get the current network information 
    const network = await provider.getNetwork();
    console.log("Network:", network.chainId);
// create contract instance using address from config, ABI and provider 
    const loadedEthcommerce = new ethers.Contract(
      config[network.chainId].ethcommerce.address,
      Ethcommerce,
      provider
    );
    // log first item for debugging 
    console.log(await loadedEthcommerce.items(1));
    setEthcommerce(loadedEthcommerce);
// array to store all items 
    const items = [];

    for (var i = 0; i < 9; i++) {
      const item = await ethcommerce.items(i + 1);
      items.push(item);
    }
    console.log(items, loadedEthcommerce, "hi");
    const electronics = items.filter((item) => item.category === "electronics");
    const clothing = items.filter((item) => item.category === "clothing");
    const toys = items.filter((item) => item.category === "toys");

    setElectronics(electronics);
    setClothing(clothing);
    setToys(toys);
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <h2>Dappazon Best Sellers</h2>
      <h2>Ethcommerce Best Sellers</h2>
    </div>
  );
}

export default App;
