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

  //add vars for handling errors and loading state
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // fx to init blockchain connection and load data 
  const loadBlockchainData = async () => {


try{

  // metamask check 
  if(!window.ethereum){
    throw new Error("MetaMask is not installed! Please install metamask")
  }
    // create a new provider using metmask 
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    // get the current network information 
    const network = await provider.getNetwork();
    // check if the config is available for this network 
    if (!config[network.chainId]){
      throw new Error (`Unsupported network. Please connect to the correct network`)
    }
    console.log("Network:", network.chainId);


    // create contract instance using address from config, ABI and provider 
    const loadedEthcommerce = new ethers.Contract(
      config[network.chainId].ethcommerce.address,
      Ethcommerce,
      provider
    );

    if (!loadedEthcommerce){
      throw new Error ("Failed to load contract")
    }

    // log first item for debugging 
    console.log(await loadedEthcommerce.items(1));


    setEthcommerce(loadedEthcommerce);


    // array to store all items 
    const items = [];
      for (var i = 0; i < 9; i++) {
        try {
           // fetch first 9 items from the smart contract 
          const item = await loadedEthcommerce.items(i + 1);
          if (item) {
            items.push(item);
          }
        } catch (itemError) {
          console.warn(`Failed to load item ${i + 1}:`, itemError);
          continue; // Skip this item but continue loading others
        }
      }

    console.log(items, loadedEthcommerce, "hi");

    // filter items by category 
    const electronics = items.filter((item) => item.category === "electronics");
    const clothing = items.filter((item) => item.category === "clothing");
    const toys = items.filter((item) => item.category === "toys");
// update state with filtered items 
    setElectronics(electronics);
    setClothing(clothing);
    setToys(toys);
    setError(null);

  }catch(error) {
      console.error("Error in loadBlockchainData:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }



  };
// run loadBlockchainData when component mounts 
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
