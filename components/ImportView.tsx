
import React, { useState, useRef } from 'react';
import { scanReceipt, ExtractedTransaction } from '../services/geminiService';
import { parseCSVStatement, isLocalFileCompatible, parsePDFStatement } from '../services/importService';
import { Transaction, TransactionType } from '../types';
import { IMAGES } from '../constants';

interface ImportViewProps {
  onBack: () => void;
  onSaveTransactions: (txs: Omit<Transaction, 'id'>[]) => void;
}

const ImportView: React.FC<ImportViewProps> = ({ onBack, onSaveTransactions }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMode, setProcessingMode] = useState<'AI' | 'Local' | null>(null);
  const [scannedTxs, setScannedTxs] = useState<ExtractedTransaction[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
    setIsProcessing(true);
    setHasScanned(false);

    try {
      if (isLocalFileCompatible(file)) {
        setProcessingMode('Local');
        let localTxs: ExtractedTransaction[] = [];
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (extension === 'pdf') {
          localTxs = await parsePDFStatement(file);
        } else {
          localTxs = await parseCSVStatement(file);
        }

        if (localTxs && localTxs.length > 0) {
          setScannedTxs(localTxs);
        } else {
          setError('Nenhuma transação encontrada no arquivo. Verifique o formato.');
        }
        setIsProcessing(false);
        setHasScanned(true);
      } else {
        setProcessingMode('AI');
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = reader.result as string;
            const results = await scanReceipt(base64);
            if (results && results.length > 0) {
              setScannedTxs(results);
            } else {
              setError('Não foi possível extrair dados desta imagem. Verifique se a foto está nítida.');
            }
          } catch (error: any) {
            console.error('Erro no scanner:', error);
            const errorMsg = error.message || '';
            if (errorMsg.includes('API key') || errorMsg.includes('Chave de API')) {
              setError('Erro de Configuração: Sua chave do Gemini está ausente ou inválida no .env.local.');
            } else if (errorMsg.includes('quota')) {
              setError('Limite Excedido: Você atingiu o limite de uso gratuito do Gemini. Tente novamente mais tarde.');
            } else {
              setError(`Erro Técnico: ${errorMsg || 'Erro na comunicação com a IA.'}`);
            }
          } finally {
            setIsProcessing(false);
            setHasScanned(true);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      setError(`Erro ao processar arquivo: ${err.message || 'Erro desconhecido'}`);
      setIsProcessing(false);
      setHasScanned(true);
    }
  };

  const handleAIFallback = async () => {
    if (!selectedFile) return;
    setError(null);
    setIsProcessing(true);
    setHasScanned(false);
    setProcessingMode('AI');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const results = await scanReceipt(base64);
        if (results && results.length > 0) {
          setScannedTxs(results);
        } else {
          setError('A IA também não conseguiu identificar dados neste documento. Verifique se ele contém transações legíveis.');
        }
      } catch (error: any) {
        setError(`Erro na IA: ${error.message || 'Erro desconhecido'}`);
      } finally {
        setIsProcessing(false);
        setHasScanned(true);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleConfirm = () => {
    const finalTxs = scannedTxs.map(st => ({
      description: st.description,
      amount: -Math.abs(st.amount),
      date: st.date || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      category: st.category || 'Outros',
      type: TransactionType.EXPENSE,
      icon: 'receipt_long'
    }));
    onSaveTransactions(finalTxs);
  };

  return (
    <div className="flex flex-col bg-[#0a0f0c] animate-slide-up h-screen">
      <header className="flex items-center p-6 sticky top-0 z-50 bg-[#0a0f0c]/80 backdrop-blur-xl">
        <button onClick={onBack} className="p-3 -ml-3 rounded-full hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white text-3xl">chevron_left</span>
        </button>
        <h1 className="text-xl font-bold ml-2">Importar Transações</h1>
      </header>

      <main className="flex-1 p-6 pb-24 overflow-y-auto">
        {!hasScanned && !isProcessing && (
          <div className="flex flex-col gap-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-[4/3] rounded-[32px] border-2 border-dashed border-primary/20 bg-primary/5 p-6 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-primary/40 transition-all"
            >
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.csv,.pdf" onChange={handleFileChange} />

              <div className="absolute inset-0 rounded-[32px] overflow-hidden opacity-10 group-hover:opacity-20 transition-opacity">
                <img src={IMAGES.receipt} className="w-full h-full object-cover" alt="" />
              </div>

              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-4xl">upload_file</span>
              </div>

              <div className="text-center relative">
                <p className="text-white font-bold text-lg">Selecionar Arquivo</p>
                <p className="text-gray-400 text-sm mb-1">Arraste um boleto, recibo ou extrato</p>
                <p className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">Suporta JPG, PNG, PDF ou CSV</p>
              </div>
            </div>

            <div className="glass bg-white/5 rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                <p className="text-sm font-bold">Privacidade Garantida</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Arquivos CSV e PDF são processados 100% localmente no seu navegador. Nenhuma informação financeira sai do seu dispositivo.
              </p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="relative">
              <div className="size-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl animate-pulse">
                  {processingMode === 'AI' ? 'psychology' : 'data_exploration'}
                </span>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">
                {processingMode === 'AI' ? 'IA lendo o comprovante...' : 'Processando arquivo local...'}
              </h2>
              <p className="text-gray-500 text-sm animate-pulse">Isso pode levar alguns segundos</p>
            </div>
          </div>
        )}

        {error && (
          <div className="glass bg-red-400/5 border border-red-400/20 rounded-3xl p-6 flex flex-col gap-4 animate-shake">
            <div className="flex items-center gap-3 text-red-400">
              <span className="material-symbols-outlined">error</span>
              <p className="font-bold">Ops! Algo deu errado</p>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{error}</p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => { setError(null); setHasScanned(false); setIsProcessing(false); }}
                className="text-white bg-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest"
              >
                Tentar Outro
              </button>
              {selectedFile?.name.toLowerCase().endsWith('.pdf') && (
                <button
                  onClick={handleAIFallback}
                  className="bg-primary text-[#0a0f0c] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">psychology</span> Usar IA (Fallback)
                </button>
              )}
            </div>
          </div>
        )}

        {hasScanned && scannedTxs.length > 0 && !isProcessing && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex items-baseline justify-between pl-1">
              <h2 className="text-2xl font-bold">{scannedTxs.length} Transações</h2>
              <p className="text-primary text-sm font-bold">Identificadas</p>
            </div>

            <div className="flex flex-col gap-3">
              {scannedTxs.map((tx, idx) => (
                <div key={idx} className="glass bg-white/5 p-4 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined text-xl">receipt_long</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{tx.description}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">R$ {Math.abs(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-gray-500 font-bold uppercase">Importado</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              className="w-full h-16 bg-primary text-[#0a0f0c] font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all text-lg flex items-center justify-center gap-3"
            >
              Confirmar e Salvar <span className="material-symbols-outlined">check_circle</span>
            </button>

            <button
              onClick={() => { setHasScanned(false); setScannedTxs([]); }}
              className="w-full h-12 text-gray-500 font-bold text-sm"
            >
              Cancelar
            </button>
          </div>
        )}

        {hasScanned && scannedTxs.length === 0 && !error && !isProcessing && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
            <p className="font-bold text-lg">Nenhuma transação encontrada</p>
            <p className="text-sm">Tente outro arquivo ou formato.</p>
            <button onClick={() => setHasScanned(false)} className="mt-4 text-primary font-bold">Voltar</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ImportView;
