import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Users, Zap, Loader2, AlertCircle, Plus, Trash2, Edit2 } from 'lucide-react';

const defaultMachines = [
  { name: "Bench Press", quantity: 5 },
  { name: "Treadmill", quantity: 10 },
  { name: "Squat Rack", quantity: 4 }
];

const slotNames = {
  1: "6:00 AM - 7:00 AM",
  2: "7:00 AM - 8:00 AM",
  3: "8:00 AM - 9:00 AM",
  4: "9:00 AM - 10:00 AM"
};

const equipmentOptions = ["Bench Press", "Treadmill", "Squat Rack"];

function App() {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(null);

  const [users, setUsers] = useState([
    { id: 1, name: "Lakshay", preferred_slot: 1, priority: 10, equipment: ["Bench Press"] },
    { id: 2, name: "Kartikay", preferred_slot: 1, priority: 9, equipment: ["Treadmill"] },
    { id: 3, name: "Tanish Shah", preferred_slot: 2, priority: 8, equipment: ["Squat Rack", "Bench Press"] },
    { id: 4, name: "Abhishek", preferred_slot: 3, priority: 7, equipment: ["Treadmill"] },
    { id: 5, name: "Divya", preferred_slot: 4, priority: 9, equipment: ["Squat Rack"] }
  ]);

  const [newUser, setNewUser] = useState({ name: "", preferred_slot: 1, priority: 5, equipment: [] });

  const handleAddUser = () => {
    if (!newUser.name.trim()) return alert("Name is required");
    if (newUser.equipment.length === 0) return alert("Select at least one equipment");
    
    setUsers([...users, { ...newUser, id: Date.now() }]);
    setNewUser({ name: "", preferred_slot: 1, priority: 5, equipment: [] });
  };

  const handleRemoveUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleUpdateUser = (id, field, value) => {
    setUsers(users.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const handleToggleEquipment = (userId, equip) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        const hasEquip = u.equipment.includes(equip);
        const newEq = hasEquip ? u.equipment.filter(e => e !== equip) : [...u.equipment, equip];
        return { ...u, equipment: newEq };
      }
      return u;
    }));
  };

  const handleToggleNewUserEquipment = (equip) => {
    const hasEquip = newUser.equipment.includes(equip);
    const newEq = hasEquip ? newUser.equipment.filter(e => e !== equip) : [...newUser.equipment, equip];
    setNewUser({ ...newUser, equipment: newEq });
  };

  const generateSchedule = async () => {
    if (users.length === 0) return alert("Add at least one user!");
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          users: users, 
          machines: defaultMachines 
        })
      });
      const result = await res.json();
      setSchedule(result);
    } catch (e) {
      console.error(e);
      alert("Failed to connect to backend. Is Node server running?");
    }
    setLoading(false);
  };

  const simulateCrowd = () => {
    const crowd = [...users];
    for (let i = 0; i < 75; i++) {
      crowd.push({
        id: Date.now() + i,
        name: `User_${i + 6}`,
        preferred_slot: Math.floor(Math.random() * 4) + 1,
        priority: Math.floor(Math.random() * 5) + 1,
        equipment: [equipmentOptions[Math.floor(Math.random() * equipmentOptions.length)]]
      });
    }
    setUsers(crowd);
  };

  return (
    <div className="min-h-screen relative overflow-y-auto bg-background text-white p-6">
      {/* Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neonPurple rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neonCyan rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12 mt-8"
        >
          <div className="inline-block relative">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-neonCyan to-neonPurple">
              ZyroFit
            </h1>
            <div className="absolute -inset-1 blur-lg bg-gradient-to-r from-neonCyan to-neonPurple opacity-30 rounded-lg -z-10"></div>
          </div>
          <p className="text-xl text-gray-400 font-light mt-4">
            Interactive Gym Crowd Manager &bull; Max 60 Capacity
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Add Booking Panel */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-panel p-6 lg:col-span-1 shadow-neon-cyan h-fit"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center"><Plus className="w-6 h-6 mr-2 text-neonCyan" /> Book a Slot</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">User Name</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonCyan"
                  placeholder="Enter name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Time Slot</label>
                  <select 
                    value={newUser.preferred_slot}
                    onChange={(e) => setNewUser({...newUser, preferred_slot: parseInt(e.target.value)})}
                    className="w-full bg-[#111626] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonCyan"
                  >
                    {[1,2,3,4].map(s => <option key={s} value={s}>{slotNames[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Priority (1-10)</label>
                  <input 
                    type="number" min="1" max="10"
                    value={newUser.priority}
                    onChange={(e) => setNewUser({...newUser, priority: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonCyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Required Equipment</label>
                <div className="flex flex-wrap gap-2">
                  {equipmentOptions.map(eq => (
                    <button 
                      key={eq}
                      onClick={() => handleToggleNewUserEquipment(eq)}
                      className={`px-3 py-1 text-sm rounded-full border transition-all ${
                        newUser.equipment.includes(eq) 
                          ? 'bg-neonCyan/20 border-neonCyan text-neonCyan shadow-[0_0_10px_rgba(0,245,255,0.3)]' 
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAddUser}
                className="w-full mt-4 py-3 rounded-lg font-bold bg-white/10 hover:bg-neonCyan/20 hover:text-neonCyan border border-transparent hover:border-neonCyan transition-all flex justify-center items-center"
              >
                <Plus className="w-5 h-5 mr-2" /> Add Booking
              </button>
            </div>
          </motion.div>

          {/* User List Panel */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-panel p-6 lg:col-span-2 overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center"><Users className="w-6 h-6 mr-2 text-neonPurple" /> Active Queue ({users.length})</h2>
              <div className="space-x-3">
                <button onClick={simulateCrowd} className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors">
                  + Simulate 75 Random Users
                </button>
                <button onClick={() => setUsers([])} className="text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-md transition-colors">
                  Clear All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[400px] border border-white/10 rounded-lg custom-scrollbar">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-gray-300">Name</th>
                    <th className="py-3 px-4 font-semibold text-gray-300">Time Slot</th>
                    <th className="py-3 px-4 font-semibold text-gray-300">Priority</th>
                    <th className="py-3 px-4 font-semibold text-gray-300">Equipment</th>
                    <th className="py-3 px-4 font-semibold text-center text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 group">
                      <td className="py-2 px-4">
                        <input 
                          type="text" 
                          value={u.name} 
                          onChange={(e) => handleUpdateUser(u.id, 'name', e.target.value)}
                          className="bg-transparent border-b border-transparent focus:border-neonCyan focus:outline-none w-32"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <select 
                          value={u.preferred_slot}
                          onChange={(e) => handleUpdateUser(u.id, 'preferred_slot', parseInt(e.target.value))}
                          className="bg-transparent text-sm border-none focus:outline-none focus:text-neonCyan text-gray-300"
                        >
                          {[1,2,3,4].map(s => <option key={s} value={s} className="bg-[#111626]">{slotNames[s]}</option>)}
                        </select>
                      </td>
                      <td className="py-2 px-4">
                        <input 
                          type="number" min="1" max="10"
                          value={u.priority} 
                          onChange={(e) => handleUpdateUser(u.id, 'priority', parseInt(e.target.value))}
                          className="bg-transparent border-b border-transparent focus:border-neonCyan focus:outline-none w-12 text-center"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex gap-1 flex-wrap w-48">
                          {equipmentOptions.map(eq => (
                            <span 
                              key={eq}
                              onClick={() => handleToggleEquipment(u.id, eq)}
                              className={`cursor-pointer text-[10px] px-2 py-0.5 rounded-full border ${u.equipment.includes(eq) ? 'bg-neonPurple/20 border-neonPurple text-neonPurple' : 'bg-transparent border-white/20 text-gray-500 hover:border-white/50'}`}
                            >
                              {eq}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-center">
                        <button onClick={() => handleRemoveUser(u.id)} className="text-red-400 hover:text-red-300 p-1 bg-red-400/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan="5" className="py-8 text-center text-gray-500">No users in queue.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <button 
              onClick={generateSchedule}
              disabled={loading || users.length === 0}
              className="w-full mt-6 py-4 px-6 rounded-lg font-bold text-lg bg-gradient-to-r from-neonPurple to-neonCyan text-white shadow-lg hover:shadow-neon-cyan transition-all transform hover:scale-[1.02] disabled:opacity-50 flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Activity className="w-5 h-5 mr-2" />}
              {loading ? "Optimizing via C Engine..." : "Generate Optimized Schedule"}
            </button>
          </motion.div>
        </div>

        {/* Results Dashboard */}
        {schedule && !schedule.error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-20"
          >
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 border-l-4 border-l-neonCyan">
                <div className="flex items-center text-gray-400 mb-2"><Users className="w-5 h-5 mr-2" /> Total Processed</div>
                <div className="text-4xl font-bold">{schedule.metrics.total_users}</div>
              </div>
              <div className="glass-panel p-6 border-l-4 border-l-green-400">
                <div className="flex items-center text-gray-400 mb-2"><Activity className="w-5 h-5 mr-2" /> Scheduled Successfully</div>
                <div className="text-4xl font-bold text-green-400">{schedule.metrics.scheduled}</div>
              </div>
              <div className="glass-panel p-6 border-l-4 border-l-red-400">
                <div className="flex items-center text-gray-400 mb-2"><AlertCircle className="w-5 h-5 mr-2" /> Waitlisted</div>
                <div className="text-4xl font-bold text-red-400">{schedule.metrics.rejected}</div>
              </div>
            </div>

            {/* Slot Utilization */}
            <div className="glass-panel p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center"><Clock className="w-6 h-6 mr-3 text-neonCyan" /> Gym Capacity (Slot Utilization)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {schedule.slot_usage.map(slot => {
                  const isFull = slot.capacity >= slot.max;
                  return (
                    <div key={slot.slot} className={`p-4 rounded-xl border ${isFull ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/10'}`}>
                      <div className="text-sm text-gray-400 mb-1">{slotNames[slot.slot]}</div>
                      <div className="text-2xl font-bold">
                        <span className={isFull ? 'text-red-400' : 'text-white'}>{slot.capacity}</span>
                        <span className="text-gray-500"> / {slot.max}</span>
                      </div>
                      {isFull && <div className="text-xs text-red-400 mt-2 font-bold uppercase tracking-wider">Slot Full</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Final Schedule Table */}
                <div className="glass-panel p-8 lg:col-span-2">
                <h3 className="text-2xl font-bold mb-6 flex items-center"><Activity className="w-6 h-6 mr-3 text-neonPurple" /> DP Optimized Schedule</h3>
                <div className="overflow-x-auto overflow-y-auto max-h-[500px] custom-scrollbar rounded-xl border border-white/10">
                    <table className="w-full text-left">
                    <thead className="bg-white/5 sticky top-0 backdrop-blur-md z-10">
                        <tr>
                        <th className="py-4 px-6 font-semibold">User</th>
                        <th className="py-4 px-6 font-semibold">Assigned Time</th>
                        <th className="py-4 px-6 font-semibold">Equipment (Knapsack Selected)</th>
                        <th className="py-4 px-6 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.schedule.map((row, idx) => (
                        <motion.tr 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: Math.min(idx * 0.02, 1) }}
                            key={idx} 
                            className="border-b border-white/5 hover:bg-white/5"
                        >
                            <td className="py-3 px-6 font-medium text-neonCyan">{row.name.replace(/_/g, ' ')}</td>
                            <td className="py-3 px-6">{slotNames[row.slot]}</td>
                            <td className="py-3 px-6 text-neonPurple">{row.equipment.join(', ')}</td>
                            <td className="py-3 px-6"><span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">Scheduled</span></td>
                        </motion.tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>

                {/* Waitlist */}
                <div className="glass-panel p-8 border border-red-500/20 lg:col-span-1 flex flex-col">
                <h3 className="text-2xl font-bold mb-6 flex items-center text-red-400"><AlertCircle className="w-6 h-6 mr-3" /> Waitlisted</h3>
                <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-grow max-h-[500px]">
                    {schedule.waitlist.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">Everyone was accommodated!</div>
                    ) : schedule.waitlist.map((u, idx) => (
                    <div key={idx} className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-sm">
                        <div className="font-bold text-gray-200 mb-1">{u.name.replace(/_/g, ' ')}</div>
                        <div className="text-red-400 text-xs">Reason: {u.reason.replace(/_/g, ' ')}</div>
                    </div>
                    ))}
                </div>
                </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
