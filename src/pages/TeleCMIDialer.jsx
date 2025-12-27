import React, { useState, useEffect, useRef } from 'react';
import PIOPIY from 'piopiyjs';

const decode = (value) => {
  if (!value) return "";
  try {
    return atob(value);
  } catch (err) {
    console.error("Decode failed:", err);
    return "";
  }
};




const TeleCMIDialer = () => {
  const piopiyRef = useRef(null);
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio('') : null);
  const isMountedRef = useRef(true);
  const loginTimerRef = useRef(null);
   const [TelecmiID, setTelecmiID] = useState(decode(localStorage.getItem("TelecmiID")));
  const [TelecmiPassword, setTelecmiPassword] = useState(decode(localStorage.getItem("TelecmiPassword")));

 

 const CREDENTIALS = {
  userId: TelecmiID, 
  password: TelecmiPassword,
  sbcUrl: '@sbcind.telecmi.com'
};
console.log(TelecmiID,"TelecmiID")



  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [callStatus, setCallStatus] = useState('Idle');
  const [phoneNumber, setPhoneNumber] = useState('91');
  const [incomingCallData, setIncomingCallData] = useState(null);
  console.log(incomingCallData,"incomingCallData")
  
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false); // New state for speaker

  // Reusable function to clear UI state
  const resetCallState = () => {
    stopRingtone();
    setCallStatus('Idle');
    setIncomingCallData(null);
    setIsMuted(false);
    setIsOnHold(false);
    setIsSpeakerOn(false);
  };

  useEffect(() => {
    isMountedRef.current = true;
    if (audioRef.current) audioRef.current.loop = true;

    if (!piopiyRef.current) {
        piopiyRef.current = new PIOPIY({
            name: 'Eethal CRM Agent',
            debug: true, 
            autoplay: true,
            ringTime: 60
        });

        const sdk = piopiyRef.current;

        sdk.on('login', (res) => handleSuccess(res));
        
        sdk.on('loginFailed', (res) => {
            if (res && (res.code == 200 || res.msg === "User loged in successfully")) {
                handleSuccess(res);
            } else {
                setIsLoggedIn(false);
            }
        });

        const handleSuccess = (res) => {
            if (!isMountedRef.current) return;
            setIsLoggedIn(true);
            if (res.agent && res.agent.name) setAgentName(res.agent.name);
        };

        sdk.on('trying', () => setCallStatus('Calling...'));
        sdk.on('ringing', () => setCallStatus('Ringing...'));
        sdk.on('answered', () => {
            stopRingtone();
            setCallStatus('Connected');
        });
        
        // Triggers when the OTHER side hangs up
sdk.on('ended', () => {
    stopRingtone(); // Ensure ringtone stops immediately
    resetCallState();
});

sdk.on('cancel', () => {
    resetCallState();
});

        sdk.on('inComingCall', (callObj) => {
            playRingtone(); 
            setIncomingCallData(callObj);
            setCallStatus('Incoming Call...');
        });

        sdk.on('mediaFailed', () => {
            resetCallState();
            alert('Please check your Audio Device');
        });

        sdk.on('error', (err) => console.error('❌ SDK Error:', err));
    }

    // loginTimerRef.current = setTimeout(() => {
    //     if (isMountedRef.current && piopiyRef.current && !isLoggedIn) {
    //         piopiyRef.current.login(CREDENTIALS.userId, CREDENTIALS.password, CREDENTIALS.sbcUrl);
    //     }
    // }, 800);

    loginTimerRef.current = setTimeout(() => {
  isMountedRef.current && piopiyRef.current && !isLoggedIn
    ? (TelecmiID && TelecmiPassword
        ? piopiyRef.current.login(
            CREDENTIALS.userId,
            CREDENTIALS.password,
            CREDENTIALS.sbcUrl
          )
        : null)
    : null;
}, 800);


    return () => {
      isMountedRef.current = false;
      stopRingtone();
      if (loginTimerRef.current) clearTimeout(loginTimerRef.current);
      if (piopiyRef.current) {
        piopiyRef.current?.logout();
        piopiyRef.current = null; 
      }
    };
  }, []);

  const playRingtone = () => {
    if(audioRef.current && localStorage.muteRingtone !== 'true') {
        audioRef.current.play().catch(e => console.log("Audio blocked", e));
    }
  };

  const stopRingtone = () => {
    if(audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
  };
const handleReject = () => {
    console.log("Rejecting call...", incomingCallData);
    stopRingtone();
    
    if (piopiyRef.current) {
      piopiyRef.current.terminate();
        setTimeout(() => {
            resetCallState();
        }, 1000); 
    } else {
        resetCallState();
    }
};

const handleAnswer = () => {
    stopRingtone();
    if (piopiyRef.current) {
        piopiyRef.current.answer();
        setCallStatus('Connected');
        setPhoneNumber(incomingCallData.from || 'Unknown');
        setIncomingCallData(null);
    }
};
  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Check if the value starts with 91. If they try to delete it, force it back.
    if (value.startsWith('91')) {
        // Allow only digits (keeps the prefix and adds new numbers)
        const onlyNums = value.replace(/[^\d]/g, '');
        setPhoneNumber(onlyNums);
    } else if (value.length < 2) {
        // If they try to backspace the '91', reset it to '91'
        setPhoneNumber('91');
    }
};

const handleCall = () => {
    if (!phoneNumber || phoneNumber === '91') return alert('Please enter a number after 91');
    
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    // Standard Indian mobile number would be 12 digits (91 + 10 digits)
    if (cleanNumber.length < 10) return alert('Invalid Phone Number');
    
    console.log("Dialing:", cleanNumber);
    if (piopiyRef.current) {
        piopiyRef.current.call(cleanNumber);
    }
};

  const handleHangup = () => {
    if (piopiyRef.current) {
        piopiyRef.current.terminate();
    }
    // Force UI reset immediately after clicking "End Call"
    resetCallState();
  };

  const toggleMute = () => {
    if (!piopiyRef.current) return;
    isMuted ? piopiyRef.current.unMute() : piopiyRef.current.mute();
    setIsMuted(!isMuted);
  };

  const toggleHold = () => {
    if (!piopiyRef.current) return;
    isOnHold ? piopiyRef.current.unHold() : piopiyRef.current.hold();
    setIsOnHold(!isOnHold);
  };

  const toggleSpeaker = () => {
    if (!piopiyRef.current) return;
    // Note: speaker(true) usually routes to loud speaker if supported by the browser/device
    piopiyRef.current.speaker(!isSpeakerOn);
    setIsSpeakerOn(!isSpeakerOn);
  };

  const styles = {
    container: { maxWidth: '350px', margin: '20px auto', fontFamily: 'Segoe UI, sans-serif', border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: '#fff' },
    header: { background: isLoggedIn ? '#10B981' : '#6B7280', color: 'white', padding: '15px', textAlign: 'center' },
    headerTitle: { margin: 0, fontSize: '18px', fontWeight: '600' },
    headerSub: { fontSize: '12px', opacity: 0.9 },
    body: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', minHeight: '200px' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', outline: 'none', color:'#333' },
    btnPrimary: { background: '#2563EB', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%' },
    btnDanger: { background: '#EF4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%' },
    btnGrid: { background: '#F3F4F6', color: '#1F2937', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }, // Adjusted to 2 cols for better look
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', width: '300px' }
  };

  return (
    <div className='p-6'>
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.headerTitle}>Dialer</h3>
        <div style={styles.headerSub}>
           {isLoggedIn ? `🟢 Online as ${agentName || 'Agent'}` : '🔴 Connecting...'}
        </div>
      </div>

      <div style={styles.body}>
        <div>Current Status: <strong style={{color: callStatus === 'Connected' ? '#10B981' : '#333'}}>{callStatus}</strong></div>

        {callStatus === 'Idle' ? (
          <>
            <input type="tel" placeholder="Enter number..." value={phoneNumber} onChange={handleInputChange} style={styles.input} />
            <button onClick={handleCall} style={{...styles.btnPrimary, opacity: isLoggedIn ? 1 : 0.5}}>Call Now</button>
          </>
        ) : (
          <>
            <div style={{textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#1F2937'}}>{phoneNumber !== '91' ? phoneNumber : incomingCallData?.from || 'Unknown'}</div>

            {callStatus === 'Connected' && (
              <div style={styles.grid}>
                <button onClick={toggleMute} style={styles.btnGrid}>{isMuted ? '🔇 Unmute' : '🎤 Mute'}</button>
                <button onClick={toggleHold} style={styles.btnGrid}>{isOnHold ? '▶ Resume' : '⏸ Hold'}</button>
                {/* <button onClick={toggleSpeaker} style={styles.btnGrid}>{isSpeakerOn ? '🔊 Speaker Off' : '🔈 Speaker On'}</button> */}
                <button onClick={() => alert('Keypad coming soon')} style={styles.btnGrid}>🔢 Keypad</button>
              </div>
            )}

            <button onClick={handleHangup} style={styles.btnDanger}>End Call</button>
          </>
        )}
      </div>

      {incomingCallData && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{color:'#2563EB'}}>Incoming Call...</h3>
            <p style={{fontSize: '18px', fontWeight: 'bold', color: '#2563EB'}}>{incomingCallData.from}</p>
            <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
              <button onClick={() => { handleAnswer()}} style={{...styles.btnPrimary, background:'#10B981', width:'auto'}}>Answer</button>
              <button onClick={() => { handleReject()}} style={{...styles.btnDanger, width:'auto'}}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default TeleCMIDialer;