import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Lock, Delete, Shield, Languages, Check, RefreshCw } from 'lucide-react';

export const PinLockScreen: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    pinCode, 
    setPinCode, 
    setIsUnlocked,
    showToast
  } = useAppContext();

  const [inputVal, setInputVal] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // States to handle PIN setup if a PIN doesn't exist yet
  const [isSettingUp, setIsSettingUp] = useState<boolean>(!pinCode);
  const [setupStep, setSetupStep] = useState<'create' | 'confirm'>('create');
  const [tempPin, setTempPin] = useState<string>('');

  // Localized texts
  const texts = {
    HT: {
      enterPin: "Antre kòd PIN sekirite ou",
      createPin: "Kreye yon kòd PIN (4 chif)",
      confirmPin: "Konfime kòd PIN ou a",
      incorrect: "Kòd PIN sa a pa kòrèk, re-eseye!",
      mismatch: "Kòd yo pa koresponn! Kòmanse nèt.",
      successSetup: "Kòd PIN anregistre avèk siksè! 🎉",
      digitsOnly: "4 chif sèlman!",
      backspace: "Retounen",
      clear: "Efase"
    },
    FR: {
      enterPin: "Saisir votre code PIN de sécurité",
      createPin: "Créer un code PIN (4 chiffres)",
      confirmPin: "Confirmer votre code PIN",
      incorrect: "Code PIN incorrect, réessayez !",
      mismatch: "Les codes ne correspondent pas, recommencez !",
      successSetup: "Code PIN configuré avec succès ! 🎉",
      digitsOnly: "4 chiffres seulement !",
      backspace: "Retour",
      clear: "Effacer"
    },
    EN: {
      enterPin: "Enter your security PIN",
      createPin: "Create a 4-digit PIN",
      confirmPin: "Confirm your PIN code",
      incorrect: "Incorrect PIN code, try again!",
      mismatch: "PIN codes do not match, start over!",
      successSetup: "PIN code configured successfully! 🎉",
      digitsOnly: "4 digits only!",
      backspace: "Backspace",
      clear: "Clear"
    }
  };

  const t = texts[language] || texts.HT;

  // Handle auto-submit/validation when string reaches 4 digits
  useEffect(() => {
    if (inputVal.length === 4) {
      if (isSettingUp) {
        if (setupStep === 'create') {
          // Set temp pin, move to confirm
          setTempPin(inputVal);
          setSetupStep('confirm');
          setInputVal('');
          setErrorMessage('');
        } else {
          // Confirm step
          if (inputVal === tempPin) {
            setPinCode(inputVal);
            showToast(t.successSetup, 'success');
            setIsUnlocked(true);
          } else {
            // Mismatch
            triggerShake(t.mismatch);
            setSetupStep('create');
            setTempPin('');
            setInputVal('');
          }
        }
      } else {
        // Authenticate
        if (inputVal === pinCode) {
          setIsUnlocked(true);
        } else {
          triggerShake(t.incorrect);
          setInputVal('');
        }
      }
    }
  }, [inputVal]);

  const triggerShake = (msg: string) => {
    setErrorMessage(msg);
    setIsShaking(true);
    // Vibrate device if API is supported
    if (navigator.vibrate) {
      navigator.vibrate(120);
    }
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  };

  const handleKeyPress = (num: string) => {
    if (inputVal.length < 4) {
      setErrorMessage('');
      setInputVal(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setInputVal(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInputVal('');
    setErrorMessage('');
  };

  const handleLangToggle = () => {
    const langs: ('HT' | 'FR' | 'EN')[] = ['HT', 'FR', 'EN'];
    const nextIdx = (langs.indexOf(language) + 1) % langs.length;
    setLanguage(langs[nextIdx]);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 p-6 select-none overflow-y-auto">
      {/* Background patterns */}
      <div className="fixed top-0 right-1/4 w-[350px] h-[350px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none -y-10"></div>
      <div className="fixed bottom-12 left-1/4 w-[350px] h-[350px] bg-red-600/5 blur-[100px] rounded-full pointer-events-none -y-10"></div>

      <div className="w-full max-w-sm flex flex-col items-center space-y-8 relative z-10">
        
        {/* Toggle Language on Lock Screen */}
        <button 
          onClick={handleLangToggle}
          className="absolute -top-12 right-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-amber-400 hover:border-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Languages size={13} />
          <span>{language === 'HT' ? 'Kreyòl' : language === 'FR' ? 'Français' : 'English'}</span>
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-[0_0_25px_rgba(242,202,80,0.2)] mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-neutral-900 rounded-[14px] flex items-center justify-center text-amber-400">
              <Lock size={28} className={isShaking ? 'animate-bounce' : ''} />
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-100 font-display">
            Spargn Ayiti
          </h2>
          <p className="text-neutral-400 text-xs font-medium max-w-[280px] mx-auto leading-relaxed">
            {isSettingUp 
              ? (setupStep === 'create' ? t.createPin : t.confirmPin)
              : t.enterPin
            }
          </p>
        </div>

        {/* Display Dots with cool status / shake */}
        <div className="flex flex-col items-center space-y-4">
          <div className={`flex gap-5 px-6 py-3 rounded-full bg-neutral-900/60 border border-white/5 ${isShaking ? 'animate-bounce text-red-500 border-red-500/40' : ''}`}>
            {[0, 1, 2, 3].map((index) => {
              const isActive = inputVal.length > index;
              return (
                <div 
                  key={index} 
                  className={`w-4 h-4 rounded-full transition-all duration-150 ${
                    isActive 
                      ? 'bg-amber-400 scale-110 shadow-[0_0_12px_rgba(242,202,80,0.6)]' 
                      : 'bg-neutral-800 border border-white/5 shadow-inner'
                  }`}
                />
              );
            })}
          </div>

          <div className="h-6 text-center">
            {errorMessage ? (
              <span className="text-red-400 text-xs font-semibold tracking-tight animate-pulse bg-red-950/20 border border-red-500/15 px-3 py-1 rounded-full">
                ⚠️ {errorMessage}
              </span>
            ) : (
              isSettingUp && (
                <span className="text-amber-500/80 text-[10px] uppercase font-bold tracking-widest block">
                  {setupStep === 'create' ? 'Etep 1/2 : Chwazi kòd' : 'Etep 2/2 : Konfime kòd'}
                </span>
              )
            )}
          </div>
        </div>

        {/* Numeric Numpad layout */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-6 w-full px-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full bg-neutral-900 border border-white/5 hover:border-amber-400/30 hover:bg-neutral-800 text-neutral-100 hover:text-amber-400 font-display font-medium text-xl flex items-center justify-center transition-all duration-150 active:scale-90 shadow-md cursor-pointer mx-auto"
            >
              {num}
            </button>
          ))}

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="w-16 h-16 rounded-full text-xs font-bold text-neutral-500 hover:text-red-400 hover:bg-red-500/5 transition-all flex items-center justify-center cursor-pointer active:scale-95 uppercase tracking-wider mx-auto"
          >
            {t.clear}
          </button>

          {/* Zero key */}
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-neutral-900 border border-white/5 hover:border-amber-400/30 hover:bg-neutral-800 text-neutral-100 hover:text-amber-400 font-display font-medium text-xl flex items-center justify-center transition-all duration-150 active:scale-90 shadow-md cursor-pointer mx-auto"
          >
            0
          </button>

          {/* Delete key */}
          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full text-neutral-500 hover:text-neutral-200 transition-all flex items-center justify-center cursor-pointer active:scale-90 mx-auto"
            aria-label="Delete last"
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Small security footer */}
        <p className="text-[10px] text-neutral-600 font-mono flex items-center gap-1.5 opacity-80 pt-4">
          <Shield size={10} className="text-emerald-500" />
          <span>Kòd chifre lokalman sèlman (Offline AES)</span>
        </p>

      </div>
    </div>
  );
};
