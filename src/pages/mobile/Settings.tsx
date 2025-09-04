import { useState } from "react";
import { motion } from "framer-motion";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { WalletButton } from "@/components/wallet/WalletButton";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Wallet, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Smartphone, 
  Server,
  Upload,
  Edit,
  Globe,
  Zap,
  Camera
} from "lucide-react";

export function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [customRPC, setCustomRPC] = useState("");
  const [profileData, setProfileData] = useState({
    displayName: "Alex Green",
    bio: "Eco warrior committed to sustainability",
    rewardAccount: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <MobileHeader title="Settings" />
      
      <main className="p-4 space-y-6">
        
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <EcoCard>
            <EcoCardHeader>
              <EcoCardTitle className="flex items-center space-x-2">
                <User size={20} />
                <span>Profile</span>
              </EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent className="space-y-6">
              {/* Avatar & Basic Info */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="bg-eco-primary text-white text-xl font-bold">
                      AG
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-eco-primary hover:bg-eco-primary/90"
                  >
                    <Camera size={14} />
                  </Button>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{profileData.displayName}</h3>
                  <p className="text-sm text-muted-foreground">Level 12 Eco Warrior</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="bg-eco-success/20 text-eco-success">
                      Verified
                    </Badge>
                    <Badge variant="outline">2.8K PLY</Badge>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    className="mt-1"
                  />
                </div>

                <Button className="w-full" variant="outline">
                  <Edit size={16} className="mr-2" />
                  Update Profile
                </Button>
              </div>
            </EcoCardContent>
          </EcoCard>
        </motion.div>

        {/* Wallet & Rewards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <EcoCard>
            <EcoCardHeader>
              <EcoCardTitle className="flex items-center space-x-2">
                <Wallet size={20} />
                <span>Wallet & Rewards</span>
              </EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent className="space-y-4">
              {/* Wallet Connection */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Wallet Connection</p>
                  <p className="text-sm text-muted-foreground">Manage your Solana wallet</p>
                </div>
                <WalletButton />
              </div>

              {/* Reward Account */}
              <div>
                <Label htmlFor="rewardAccount">Reward Account (Solana)</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="rewardAccount"
                    value={profileData.rewardAccount}
                    onChange={(e) => setProfileData({...profileData, rewardAccount: e.target.value})}
                    placeholder="Enter your Solana wallet address"
                    className="flex-1 font-mono text-sm"
                  />
                  <Button variant="outline" size="sm">
                    <Edit size={16} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  PLY tokens and rewards will be sent to this address
                </p>
              </div>
            </EcoCardContent>
          </EcoCard>
        </motion.div>

        {/* Network Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <EcoCard>
            <EcoCardHeader>
              <EcoCardTitle className="flex items-center space-x-2">
                <Server size={20} />
                <span>Network Settings</span>
              </EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent className="space-y-4">
              
              {/* RPC Provider */}
              <div>
                <Label htmlFor="customRPC">Custom RPC Endpoint</Label>
                <Input
                  id="customRPC"
                  value={customRPC}
                  onChange={(e) => setCustomRPC(e.target.value)}
                  placeholder="https://api.mainnet-beta.solana.com"
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use custom Solana RPC (Helius, QuickNode, etc.)
                </p>
              </div>

              {/* Blockchain Network */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Network</p>
                  <p className="text-sm text-muted-foreground">Solana Mainnet Beta</p>
                </div>
                <Badge variant="secondary" className="bg-eco-success/20 text-eco-success">
                  Connected
                </Badge>
              </div>

            </EcoCardContent>
          </EcoCard>
        </motion.div>

        {/* App Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <EcoCard>
            <EcoCardHeader>
              <EcoCardTitle className="flex items-center space-x-2">
                <SettingsIcon size={20} />
                <span>Preferences</span>
              </EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent className="space-y-4">
              
              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell size={20} className="text-muted-foreground" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive reward and project updates</p>
                  </div>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              <Separator />

              {/* Biometric Security */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield size={20} className="text-muted-foreground" />
                  <div>
                    <p className="font-medium">Biometric Security</p>
                    <p className="text-sm text-muted-foreground">Use fingerprint or face unlock</p>
                  </div>
                </div>
                <Switch
                  checked={biometrics}
                  onCheckedChange={setBiometrics}
                />
              </div>

              <Separator />

              {/* Camera Access */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Camera size={20} className="text-muted-foreground" />
                  <div>
                    <p className="font-medium">Camera Access</p>
                    <p className="text-sm text-muted-foreground">Required for QR scanning</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-eco-success/20 text-eco-success">
                  Enabled
                </Badge>
              </div>

            </EcoCardContent>
          </EcoCard>
        </motion.div>

        {/* Data & Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <EcoCard>
            <EcoCardHeader>
              <EcoCardTitle className="flex items-center space-x-2">
                <Shield size={20} />
                <span>Data & Privacy</span>
              </EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent className="space-y-3">
              
              <Button variant="outline" className="w-full justify-start">
                <Globe size={16} className="mr-3" />
                Privacy Policy
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Zap size={16} className="mr-3" />
                Terms of Service
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Upload size={16} className="mr-3" />
                Export Data
              </Button>

            </EcoCardContent>
          </EcoCard>
        </motion.div>

      </main>
    </div>
  );
}