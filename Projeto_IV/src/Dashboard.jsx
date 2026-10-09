import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  orderBy 
} from 'firebase/firestore';

export default function Dashboard({ user, onLogout }) {
  const [fila, setFila] = useState([]);
  const [loading, setLoading] = useState(true);

  // Escuta a coleção 'senhas' em tempo real no Firestore
  useEffect(() => {
    const q = query(collection(db, 'senhas'), orderBy('criadoEm', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFila(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Alterar o status do cliente (ex: 'chamado', 'atendido')
  const handleAtualizarStatus = async (id, novoStatus) => {
    try {
      const docRef = doc(db, 'senhas', id);
      await updateDoc(docRef, { status: novoStatus });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const emEspera = fila.filter(item => item.status === 'aguardando');
  const emAtendimento = fila.find(item => item.status === 'chamado');

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.brand}>SuaFila <span style={styles.badge}>Painel</span></h1>
          <p style={styles.userEmail}>{user.email}</p>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>Sair</button>
      </header>

      <main style={styles.main}>
        {/* Painel de Chamada Principal */}
        <section style={styles.heroCard}>
          <h2 style={styles.sectionTitle}>Atendimento Atual</h2>
          {emAtendimento ? (
            <div style={styles.activeCall}>
              <span style={styles.senhaNumero}>#{emAtendimento.numero || emAtendimento.id.slice(0, 4)}</span>
              <p style={styles.clienteNome}>{emAtendimento.nomeCliente || 'Cliente sem nome'}</p>
              <button 
                onClick={() => handleAtualizarStatus(emAtendimento.id, 'concluido')}
                style={styles.completeBtn}
              >
                Concluir Atendimento
              </button>
            </div>
          ) : (
            <div style={styles.noActive}>
              <p>Nenhum cliente sendo atendido no momento.</p>
              {emEspera.length > 0 && (
                <button 
                  onClick={() => handleAtualizarStatus(emEspera[0].id, 'chamado')}
                  style={styles.callNextBtn}
                >
                  Chamar Próximo (#{emEspera[0].numero || emEspera[0].id.slice(0, 4)})
                </button>
              )}
            </div>
          )}
        </section>

        {/* Fila de Espera */}
        <section style={styles.queueSection}>
          <h3 style={styles.subTitle}>
            Fila de Espera <span style={styles.countBadge}>{emEspera.length}</span>
          </h3>

          {loading ? (
            <p>Carregando fila...</p>
          ) : emEspera.length === 0 ? (
            <p style={styles.emptyText}>A fila está vazia no momento.</p>
          ) : (
            <div style={styles.grid}>
              {emEspera.map((item, index) => (
                <div key={item.id} style={styles.queueCard}>
                  <div>
                    <span style={styles.positionText}>#{index + 1} em espera</span>
                    <h4 style={styles.cardSenha}>Senha #{item.numero || item.id.slice(0, 4)}</h4>
                    <p style={styles.cardNome}>{item.nomeCliente || 'Cliente sem nome'}</p>
                  </div>
                  <button 
                    onClick={() => handleAtualizarStatus(item.id, 'chamado')}
                    style={styles.smallCallBtn}
                  >
                    Chamar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' },
  brand: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 },
  badge: { fontSize: '0.75rem', backgroundColor: '#2563eb', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', verticalAlign: 'middle' },
  userEmail: { fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' },
  logoutBtn: { padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', color: '#0f172a', fontWeight: '600', cursor: 'pointer' },
  main: { maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' },
  heroCard: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '2rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' },
  sectionTitle: { fontSize: '1.125rem', color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  activeCall: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
  senhaNumero: { fontSize: '3.5rem', fontWeight: '800', color: '#2563eb' },
  clienteNome: { fontSize: '1.25rem', color: '#334155', fontWeight: '500' },
  completeBtn: { marginTop: '1rem', padding: '0.75rem 1.5rem', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  noActive: { padding: '1rem 0' },
  callNextBtn: { marginTop: '1rem', padding: '0.875rem 1.75rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },
  queueSection: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  subTitle: { fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  countBadge: { backgroundColor: '#e2e8f0', color: '#334155', fontSize: '0.875rem', padding: '0.2rem 0.6rem', borderRadius: '12px' },
  emptyText: { color: '#94a3b8', fontStyle: 'italic' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  queueCard: { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', backgroundColor: '#f8fafc' },
  positionText: { fontSize: '0.75rem', color: '#64748b', fontWeight: '600' },
  cardSenha: { fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0.25rem 0' },
  cardNome: { fontSize: '0.875rem', color: '#475569', margin: 0 },
  smallCallBtn: { padding: '0.5rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }
};