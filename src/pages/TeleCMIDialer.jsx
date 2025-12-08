import React, { useState, useEffect, useRef } from 'react';
import PIOPIY from 'piopiyjs';

const CREDENTIALS = {
  userId: '5002_33336639', 
  password: 'admin@123',
  sbcUrl: 'sbcind.telecmi.com'
};

const TeleCMIDialer = () => {
  // Refs
  const piopiyRef = useRef(null);
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio('') : null);
  const isMountedRef = useRef(true);
  const loginTimerRef = useRef(null);

  // UI State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [callStatus, setCallStatus] = useState('Idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [incomingCallData, setIncomingCallData] = useState(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  

  useEffect(() => {
    isMountedRef.current = true;

    if (audioRef.current) {
        audioRef.current.loop = true;
    }

    if (!piopiyRef.current) {
        console.log("🚀 Initializing TeleCMI SDK...");
        piopiyRef.current = new PIOPIY({
            name: 'Eethal CRM Agent',
            debug: true, 
            autoplay: true,
            ringTime: 60
        });

        const sdk = piopiyRef.current;

      sdk.on('login', (res) => {
    console.log('✅ Login Event (Standard):', res);
    handleSuccess(res);
});

// 2. The Quirk Handler (THIS is where your login will actually happen)
sdk.on('loginFailed', (res) => {
    console.warn('⚠️ Login Failed Event fired:', res);

    // CHECK: Is this actually a success?
    if (res && (res.code == 200 || res.msg === "User loged in successfully")) {
        console.log("🚀 SDK Quirk Detected: forcing login success!");
        handleSuccess(res); // Call the success function manually
    } else {
        // Actual failure
        setIsLoggedIn(false);
        alert("Login Failed: " + (res.msg || "Unknown Error"));
    }
});

// Shared Success Function to avoid code duplication
const handleSuccess = (res) => {
    if (!isMountedRef.current) return;
    
    setIsLoggedIn(true);
    if (res.agent && res.agent.name) {
        setAgentName(res.agent.name);
    }
};
console.log(sdk,"sdksdksdksdksdk")
        sdk.on('trying', () => setCallStatus('Calling...'));
        sdk.on('ringing', () => setCallStatus('Ringing...'));
        
        sdk.on('answered', () => {
            stopRingtone();
            setCallStatus('Connected');
        });
        
        sdk.on('ended', () => {
            stopRingtone();
            setCallStatus('Idle');
            setIncomingCallData(null);
            setIsMuted(false);
            setIsOnHold(false);
        });

        sdk.on('inComingCall', (callObj) => {
            console.log('🔔 Incoming Call:', callObj);
            playRingtone(); 
            setIncomingCallData(callObj);
            setCallStatus('Incoming Call...');
        });

        sdk.on('mediaFailed', () => {
            stopRingtone();
            alert('Please check your Audio Device');
        });

        sdk.on('error', (err) => console.error('❌ SDK Error:', err));
    }

    if (loginTimerRef.current) clearTimeout(loginTimerRef.current);
    
    loginTimerRef.current = setTimeout(() => {
        if (isMountedRef.current && piopiyRef.current && !isLoggedIn) {
            console.log("Attempting Login...");
            piopiyRef.current.login(CREDENTIALS.userId, CREDENTIALS.password, CREDENTIALS.sbcUrl);
        }
    }, 800);

    return () => {
      isMountedRef.current = false;
      stopRingtone();
      if (loginTimerRef.current) clearTimeout(loginTimerRef.current);
      
      if (piopiyRef.current) {
        piopiyRef.current.logout();
        piopiyRef.current = null; 
      }
    };
  }, []);

  const playRingtone = () => {
    if(audioRef.current && localStorage.muteRingtone !== 'true') {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log("Audio blocked", e));
    }
  };

  const stopRingtone = () => {
    if(audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
  };

  const handleCall = () => {
    if (!phoneNumber) return alert('Please enter a number');
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 5) return alert('Invalid Phone Number');
    
    console.log("Dialing:", cleanNumber);
    if (piopiyRef.current) {
        piopiyRef.current.call(cleanNumber);
    }
  };

  const handleAnswer = () => {
    stopRingtone();
    if (piopiyRef.current) piopiyRef.current.answer();
    setIncomingCallData(null);
  };

  const handleReject = () => {
    stopRingtone();
    if (piopiyRef.current) piopiyRef.current.reject();
    setIncomingCallData(null);
    setCallStatus('Idle');
  };

  const handleHangup = () => {
    stopRingtone();
    if (piopiyRef.current) piopiyRef.current.terminate();
  };

  const toggleMute = () => {
    if (!piopiyRef.current) return;
    if (isMuted) {
      piopiyRef.current.unMute();
      setIsMuted(false);
    } else {
      piopiyRef.current.mute();
      setIsMuted(true);
    }
  };

  const toggleHold = () => {
    if (!piopiyRef.current) return;
    if (isOnHold) {
      piopiyRef.current.unHold();
      setIsOnHold(false);
    } else {
      piopiyRef.current.hold();
      setIsOnHold(true);
    }
  };

  const styles = {
    container: { maxWidth: '350px', margin: '20px auto', fontFamily: 'Segoe UI, sans-serif', border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: '#fff' },
    header: { background: isLoggedIn ? '#10B981' : '#6B7280', color: 'white', padding: '15px', textAlign: 'center', transition: 'background 0.3s' },
    headerTitle: { margin: 0, fontSize: '18px', fontWeight: '600' },
    headerSub: { fontSize: '12px', opacity: 0.9 },
    body: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', minHeight: '200px' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', outline: 'none', color:'#333' },
    btnPrimary: { background: '#2563EB', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '16px', width: '100%' },
    btnDanger: { background: '#EF4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '16px', width: '100%' },
    btnGrid: { background: '#F3F4F6', color: '#1F2937', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', width: '300px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.headerTitle}>Eethal Softphone</h3>
        <div style={styles.headerSub}>
           {isLoggedIn ? `🟢 Online as ${agentName || 'Agent'}` : '🔴 Connecting...'}
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.status}>
          Current Status: <strong style={{color: callStatus === 'Connected' ? '#10B981' : '#333'}}>{callStatus}</strong>
        </div>

        {callStatus === 'Idle' ? (
          <>
            <input 
              type="tel" 
              placeholder="Enter number..." 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={styles.input}
            />
            <button 
              onClick={handleCall} 
              // disabled={!isLoggedIn} 
              style={{...styles.btnPrimary, opacity: isLoggedIn ? 1 : 0.5}}
            >
              {/* {isLoggedIn ? '📞 Call Now' : '⏳ Wait...'} */}
              Call Now
            </button>
          </>
        ) : (
          <>
            <div style={{textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#1F2937', margin: '10px 0'}}>
              {phoneNumber || incomingCallData?.from || 'Unknown'}
            </div>

            {callStatus === 'Connected' && (
              <div style={styles.grid}>
                <button onClick={toggleMute} style={styles.btnGrid}>
                  {isMuted ? '🔇 Unmute' : '🎤 Mute'}
                </button>
                <button onClick={toggleHold} style={styles.btnGrid}>
                  {isOnHold ? '▶ Resume' : '⏸ Hold'}
                </button>
                <button onClick={() => alert('Keypad coming soon')} style={styles.btnGrid}>
                   🔢 Keypad
                </button>
              </div>
            )}

            <button onClick={handleHangup} style={styles.btnDanger}>
              End Call
            </button>
          </>
        )}
      </div>

      {incomingCallData && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{margin: '0 0 10px 0', color: '#1F2937'}}>Incoming Call...</h3>
            <p style={{fontSize: '18px', fontWeight: 'bold', color: '#2563EB'}}>
              {incomingCallData.from}
            </p>
            <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'20px'}}>
              <button onClick={handleAnswer} style={{...styles.btnPrimary, background:'#10B981', width:'auto', padding:'10px 20px'}}>Answer</button>
              <button onClick={handleReject} style={{...styles.btnDanger, width:'auto', padding:'10px 20px'}}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeleCMIDialer;