import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Recycle, 
  Coins, 
  Leaf, 
  Network, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Smartphone
} from 'lucide-react';
import polymersLogo from '@/assets/polymers-logo.png';
import ecosystemBg from '@/assets/ecosystem-bg.jpg';

const Index = () => {
  const { connected } = useWallet();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    if (connected) {
      navigate('/home');
    } else {
      navigate('/auth');
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-eco-primary via-background to-eco-primary-light relative overflow-hidden"
      style={{
        backgroundImage: `url(${ecosystemBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-eco-primary/90 via-background/95 to-eco-primary/90" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center p-6">
          <div className="flex items-center space-x-3">
            <img src={polymersLogo} alt="Polymers Network" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-white">Polymers</h1>
              <p className="text-sm text-white/80">Network</p>
            </div>
          </div>
          <WalletMultiButton className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20" />
        </header>

        {/* Hero Section */}
        <section className="px-6 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20">
              🌱 Transforming Waste into Digital Assets
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              The Future of
              <span className="block bg-gradient-to-r from-eco-primary-light to-white bg-clip-text text-transparent">
                Sustainable Finance
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join the world's first DePIN network that rewards recycling with blockchain technology. 
              Turn your environmental impact into real crypto rewards.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleGetStarted}
                className="bg-white text-eco-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold h-auto"
                size="lg"
              >
                {connected ? 'Enter App' : 'Get Started'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg h-auto"
                size="lg"
              >
                <Smartphone className="mr-2 w-5 h-5" />
                Download App
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { label: 'Recycling Rewards', value: '1.2M PLY', icon: Coins },
              { label: 'Active Users', value: '25K+', icon: Users },
              { label: 'Plastic Recycled', value: '500T', icon: Recycle },
              { label: 'CO₂ Saved', value: '1.2K tons', icon: Leaf }
            ].map((stat, index) => (
              <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-eco-primary-light" />
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-white/80 text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Ecosystem Features</h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Discover how Polymers Network revolutionizes recycling through blockchain innovation
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Proof of Recycling',
                  description: 'Earn PLY tokens by submitting recycling proof through our mobile app',
                  icon: Recycle,
                  color: 'from-eco-success to-eco-primary-light'
                },
                {
                  title: 'DePIN Hardware',
                  description: 'IoT-enabled recycling bins that automatically validate submissions',
                  icon: Network,
                  color: 'from-eco-primary-light to-eco-success'
                },
                {
                  title: 'Instant Rewards',
                  description: 'Get rewarded instantly with PLY, RECO, and carbon credits',
                  icon: Zap,
                  color: 'from-eco-warning to-eco-success'
                },
                {
                  title: 'Secure & Transparent',
                  description: 'All transactions secured by Solana blockchain technology',
                  icon: Shield,
                  color: 'from-eco-info to-eco-primary-light'
                },
                {
                  title: 'Growing Community',
                  description: 'Join thousands of eco-warriors earning while saving the planet',
                  icon: Users,
                  color: 'from-eco-primary to-eco-success'
                },
                {
                  title: 'Token Staking',
                  description: 'Stake PLY tokens to earn additional rewards and governance rights',
                  icon: TrendingUp,
                  color: 'from-eco-success to-eco-primary'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                >
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 transition-colors h-full">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-white/80 text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg p-8">
              <CardContent className="space-y-6">
                <h2 className="text-3xl font-bold text-white">Ready to Start Earning?</h2>
                <p className="text-xl text-white/80">
                  Connect your Solana wallet and begin your journey towards sustainable crypto rewards
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <WalletMultiButton className="!bg-eco-success !border-0 !text-white hover:!bg-eco-success/90 !px-8 !py-4 !text-lg !font-semibold" />
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold h-auto"
                  >
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <img src={polymersLogo} alt="Polymers Network" className="w-8 h-8" />
                <div>
                  <p className="font-semibold text-white">Polymers Network</p>
                  <p className="text-sm text-white/60">Transforming Waste into Digital Assets</p>
                </div>
              </div>
              <p className="text-white/60 text-sm">
                © 2024 Polymers Network. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
