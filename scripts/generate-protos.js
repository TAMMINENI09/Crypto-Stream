const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Installing protobuf tools...');
try {
  // Install required packages locally
  execSync('npm install @bufbuild/protoc-gen-es @connectrpc/protoc-gen-connect-es', { stdio: 'inherit' });
  
  console.log('📦 Generating protobuf files...');
  
  // Create output directories if they don't exist
  const frontendGenDir = path.resolve(__dirname, '..', 'frontend', 'src', 'gen');
  const backendGenDir = path.resolve(__dirname, '..', 'backend', 'src', 'gen');
  const projectRoot = path.resolve(__dirname, '..');
  
  [frontendGenDir, backendGenDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Relative path (from project root) to avoid absolute path include issues on Windows
  const relProto = 'proto/price.proto';
  
  // Generate for frontend
  console.log('🔧 Generating frontend files...');
  execSync(
    `npx protoc \
      --plugin=./node_modules/.bin/protoc-gen-es \
      --es_out ${frontendGenDir} \
      --es_opt target=ts,import_extension=none \
      --plugin=./node_modules/.bin/protoc-gen-connect-es \
      --connect-es_out ${frontendGenDir} \
      --connect-es_opt target=ts,import_extension=none \
      -I proto \
      ${relProto}`,
    { stdio: 'inherit', cwd: projectRoot }
  );

  // Generate for backend
  console.log('🔧 Generating backend files...');
  execSync(
    `npx protoc \
      --plugin=./node_modules/.bin/protoc-gen-es \
      --es_out ${backendGenDir} \
      --es_opt target=ts,import_extension=none \
      --plugin=./node_modules/.bin/protoc-gen-connect-es \
      --connect-es_out ${backendGenDir} \
      --connect-es_opt target=ts,import_extension=none \
      -I proto \
      ${relProto}`,
    { stdio: 'inherit', cwd: projectRoot }
  );

  console.log('✅ Successfully generated all protobuf files!');
} catch (error) {
  console.error('❌ Error generating protobuf files:', error.message);
  process.exit(1);
}
