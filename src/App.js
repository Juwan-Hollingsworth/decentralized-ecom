import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Navigation from './components/Navigation';
import Section from './components/Section';
import Product from './components/Product'
import Ethcommerce from './abis/Ethcommerce.json';
import config from './config.json';

function App() {
  // State management
  const [provider, setProvider] = useState(null);
  const [ethcommerce, setEthcommerce] = useState(null);
  const [electronics, setElectronics] = useState(null);
  const [clothing, setClothing] = useState(null);
  const [toys, setToys] = useState(null);
  const [account, setAccount] = useState(null);
  const [toggle, setToggle] = useState(false);
  const [item, setItem] = useState({});

  // Toggle function for product modal
  const togglePop = (item) => {
    setItem(item);
    setToggle(!toggle);
  };

  const loadBlockchainData = async () => {
    try {
      // Check for MetaMask
      if (!window.ethereum) {
        throw new Error("Please install MetaMask");
      }

      // Initialize provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      // Get network
      const network = await provider.getNetwork();
      
      // Verify network configuration exists
      if (!config[network.chainId]) {
        throw new Error(`Network ${network.chainId} not supported`);
      }

      // Initialize contract
      const loadedEthcommerce = new ethers.Contract(
        config[network.chainId].ethcommerce.address,
        Ethcommerce,
        provider
      );

      setEthcommerce(loadedEthcommerce);

      // Fetch items
      const items = [];
      for (var i = 0; i < 9; i++) {
        try {
          const item = await loadedEthcommerce.items(i + 1);
          items.push(item);
        } catch (error) {
          console.warn(`Failed to load item ${i + 1}:`, error);
        }
      }

      // Filter items by category
      const electronics = items.filter((item) => item.category === 'electronics');
      const clothing = items.filter((item) => item.category === 'clothing');
      const toys = items.filter((item) => item.category === 'toys');

      // Update state with filtered items
      setElectronics(electronics);
      setClothing(clothing);
      setToys(toys);

    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadBlockchainData();
  }, []);

  // Add listener for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
      });
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <h2>Dappazon Best Sellers</h2>
      
      {electronics && clothing && toys && (
        <>
          <Section
            title={'Clothing & Jewelry'}
            items={clothing}
            togglePop={togglePop}
          />
          <Section
            title={'Electronics & Gadgets'}
            items={electronics}
            togglePop={togglePop}
          />
          <Section 
            title={'Toys & Gaming'} 
            items={toys} 
            togglePop={togglePop} 
          />
        </>
      )}

      {toggle && (
        <Product 
          item={item} 
          provider={provider} 
          account={account} 
          ethcommerce={ethcommerce} 
          togglePop={togglePop} 
        />
      )}
    </div>
  );
}

export default App;