// ====================================================================
// SCRIPT DE VERIFICACIÓN - Ejecutar en Console del Navegador
// Presiona F12 → Console → Pega este código → Enter
// ====================================================================

console.log('🎮 Verificando Sistema de Match Flow...\n');

// 1. Verificar API de Stages
fetch('/api/stages')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Stages disponibles:', data.length);
    console.log('📋 Lista:', data.map(s => s.name).join(', '));
  })
  .catch(err => console.error('❌ Error cargando stages:', err));

// 2. Verificar API de Torneos
fetch('/api/tournaments')
  .then(res => res.json())
  .then(data => {
    // La API devuelve un array directo
    const tournaments = Array.isArray(data) ? data : [];
    console.log('\n✅ Torneos encontrados:', tournaments.length);
    
    tournaments.forEach(t => {
      console.log(`\n📍 ${t.name}:`);
      console.log(`   - Starter Stages: ${t.starterStages?.length || 0}`);
      console.log(`   - Counterpick Stages: ${t.counterpickStages?.length || 0}`);
      console.log(`   - Status: ${t.status}`);
      
      if (t.starterStages?.length === 0) {
        console.warn('   ⚠️ Este torneo necesita configuración de stages!');
        console.log('   👉 Ve a /admin/configure-stages');
      }
    });
  })
  .catch(err => console.error('❌ Error cargando torneos:', err));

// 3. Verificar API de Personajes
fetch('/api/characters')
  .then(res => res.json())
  .then(data => {
    console.log('\n✅ Personajes disponibles:', data.length);
  })
  .catch(err => console.error('❌ Error cargando personajes:', err));

// 4. Instrucciones
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('📝 SIGUIENTE PASO:');
  console.log('='.repeat(60));
  console.log('1. Si ves ⚠️ arriba, ve a /admin/configure-stages');
  console.log('2. Selecciona un torneo');
  console.log('3. Configura starter y counterpick stages');
  console.log('4. Abre un match para probar el flujo completo');
  console.log('='.repeat(60));
}, 2000);
