const fs = require('fs');
const path = require('path');

function findFiles(dir, filterFn) {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(findFiles(fullPath, filterFn));
      } else if (filterFn(entry.name)) {
        results.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Erro ao varrer diretório ${dir}:`, err);
  }
  return results;
}

function findSingleFile(dirs, filename) {
  for (const dir of dirs) {
    const files = findFiles(dir, name => name === filename);
    if (files.length > 0) return files[0];
  }
  return null;
}

function parseSurefireReports(searchDirs) {
  let tests = 0;
  let failures = 0;
  let errors = 0;
  let skipped = 0;
  const failedTests = [];

  let xmlFiles = [];
  for (const dir of searchDirs) {
    const found = findFiles(dir, name => name.startsWith('TEST-') && name.endsWith('.xml'));
    if (found.length > 0) {
      xmlFiles = found;
      break;
    }
  }

  if (xmlFiles.length === 0) {
    return { tests, failures, errors, skipped, failedTests, found: false };
  }

  for (const filePath of xmlFiles) {
    const content = fs.readFileSync(filePath, 'utf8');

    const suiteMatch = content.match(/<testsuite[^>]*tests="(\d+)"[^>]*errors="(\d+)"[^>]*skipped="(\d+)"[^>]*failures="(\d+)"/);
    if (suiteMatch) {
      tests += parseInt(suiteMatch[1], 10);
      errors += parseInt(suiteMatch[2], 10);
      skipped += parseInt(suiteMatch[3], 10);
      failures += parseInt(suiteMatch[4], 10);
    } else {
      const altMatch = content.match(/tests="(\d+)"/);
      if (altMatch) tests += parseInt(altMatch[1], 10);
      const failMatch = content.match(/failures="(\d+)"/);
      if (failMatch) failures += parseInt(failMatch[1], 10);
      const errMatch = content.match(/errors="(\d+)"/);
      if (errMatch) errors += parseInt(errMatch[1], 10);
      const skipMatch = content.match(/skipped="(\d+)"/);
      if (skipMatch) skipped += parseInt(skipMatch[1], 10);
    }

    const testcaseRegex = /<testcase\s+name="([^"]+)"(?:\s+classname="([^"]+)")?[^>]*>([\s\S]*?)<\/testcase>/g;
    let tcMatch;
    while ((tcMatch = testcaseRegex.exec(content)) !== null) {
      const tcName = tcMatch[1];
      const tcClass = tcMatch[2] || path.basename(filePath).replace(/^TEST-|\.xml$/g, '');
      const body = tcMatch[3];

      const failMatch = body.match(/<(failure|error)\s+message="([^"]*)"[^>]*>([\s\S]*?)<\/\1>/);
      if (failMatch) {
        const errorMsg = failMatch[2] || 'Sem mensagem';
        const stackTrace = (failMatch[3] || '').trim().split('\n').slice(0, 5).join('\n');
        failedTests.push({
          component: 'Backend',
          name: `${tcClass} > ${tcName}`,
          message: errorMsg,
          details: stackTrace
        });
      }
    }
  }

  return { tests, failures, errors, skipped, failedTests, found: true };
}

function parseJacocoCsv(searchDirs) {
  const csvPath = findSingleFile(searchDirs, 'jacoco.csv');
  if (!csvPath || !fs.existsSync(csvPath)) {
    return null;
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.trim().split('\n');
  if (lines.length <= 1) return null;

  let lineMissed = 0;
  let lineCovered = 0;
  let branchMissed = 0;
  let branchCovered = 0;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 9) {
      branchMissed += parseInt(parts[5] || '0', 10);
      branchCovered += parseInt(parts[6] || '0', 10);
      lineMissed += parseInt(parts[7] || '0', 10);
      lineCovered += parseInt(parts[8] || '0', 10);
    }
  }

  const totalLines = lineCovered + lineMissed;
  const linePct = totalLines > 0 ? ((lineCovered / totalLines) * 100).toFixed(1) : '0.0';

  const totalBranches = branchCovered + branchMissed;
  const branchPct = totalBranches > 0 ? ((branchCovered / totalBranches) * 100).toFixed(1) : '0.0';

  return {
    linePct,
    branchPct,
    linesCovered: lineCovered,
    totalLines
  };
}

function parseVitestReport(searchDirs) {
  const xmlPath = findSingleFile(searchDirs, 'vitest-report.xml');
  if (!xmlPath || !fs.existsSync(xmlPath)) {
    return { tests: 0, failures: 0, errors: 0, failedTests: [], found: false };
  }

  const content = fs.readFileSync(xmlPath, 'utf8');
  let tests = 0;
  let failures = 0;
  let errors = 0;
  const failedTests = [];

  const mainMatch = content.match(/<testsuites[^>]*tests="(\d+)"[^>]*failures="(\d+)"[^>]*errors="(\d+)"/);
  if (mainMatch) {
    tests = parseInt(mainMatch[1], 10);
    failures = parseInt(mainMatch[2], 10);
    errors = parseInt(mainMatch[3], 10);
  }

  const testcaseRegex = /<testcase\s+classname="([^"]+)"\s+name="([^"]+)"[^>]*>([\s\S]*?)<\/testcase>/g;
  let tcMatch;
  while ((tcMatch = testcaseRegex.exec(content)) !== null) {
    const tcClass = tcMatch[1];
    const tcName = tcMatch[2];
    const body = tcMatch[3];

    const failMatch = body.match(/<(failure|error)\s+message="([^"]*)"[^>]*>([\s\S]*?)<\/\1>/);
    if (failMatch) {
      const errorMsg = failMatch[2] || 'Sem mensagem';
      const stackTrace = (failMatch[3] || '').trim().split('\n').slice(0, 5).join('\n');
      failedTests.push({
        component: 'Frontend',
        name: `${tcClass} > ${tcName}`,
        message: errorMsg,
        details: stackTrace
      });
    }
  }

  return { tests, failures, errors, failedTests, found: true };
}

function parseVitestCoverage(searchDirs) {
  const summaryPath = findSingleFile(searchDirs, 'coverage-summary.json');
  if (!summaryPath || !fs.existsSync(summaryPath)) {
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    if (data && data.total) {
      return {
        linePct: (data.total.lines?.pct || 0).toFixed(1),
        branchPct: (data.total.branches?.pct || 0).toFixed(1),
        linesCovered: data.total.lines?.covered || 0,
        totalLines: data.total.lines?.total || 0
      };
    }
  } catch (err) {
    console.error('Erro ao ler coverage-summary.json:', err);
  }
  return null;
}

async function fetchSonarQualityGate(projectKey, sonarHostUrl, sonarToken) {
  if (!sonarHostUrl || !sonarToken) return null;
  try {
    const authHeader = 'Basic ' + Buffer.from(sonarToken + ':').toString('base64');
    const url = `${sonarHostUrl.replace(/\/+$/, '')}/api/qualitygates/project_status?projectKey=${encodeURIComponent(projectKey)}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': authHeader
      }
    });
    if (!res.ok) {
      console.warn(`SonarQube API respondeu com status ${res.status} para ${projectKey}`);
      return null;
    }
    const data = await res.json();
    return data.projectStatus || null;
  } catch (err) {
    console.error(`Erro ao consultar Quality Gate para ${projectKey}:`, err.message);
    return null;
  }
}

async function fetchSonarIssuesPage(baseUrl, authHeader, projectKey, page, pageSize, inNewCodePeriod) {
  const periodParam = inNewCodePeriod ? '&inNewCodePeriod=true' : '';
  const url = `${baseUrl}/api/issues/search?componentKeys=${encodeURIComponent(projectKey)}${periodParam}&resolved=false&p=${page}&ps=${pageSize}&s=SEVERITY&asc=false`;
  return fetch(url, { headers: { 'Authorization': authHeader } });
}

async function fetchSonarIssues(projectKey, sonarHostUrl, sonarToken, maxIssues = 500) {
  if (!sonarHostUrl || !sonarToken) return [];
  try {
    const authHeader = 'Basic ' + Buffer.from(sonarToken + ':').toString('base64');
    const baseUrl = sonarHostUrl.replace(/\/+$/, '');
    const pageSize = 100;
    const collected = [];
    let useNewCodePeriod = true;

    for (let page = 1; collected.length < maxIssues; page += 1) {
      let res = await fetchSonarIssuesPage(baseUrl, authHeader, projectKey, page, pageSize, useNewCodePeriod);
      if (!res.ok && page === 1 && useNewCodePeriod) {
        useNewCodePeriod = false;
        res = await fetchSonarIssuesPage(baseUrl, authHeader, projectKey, page, pageSize, false);
      }

      if (!res.ok) {
        console.warn(`SonarQube API issues respondeu com status ${res.status} para ${projectKey} (página ${page})`);
        break;
      }

      const data = await res.json();
      const pageIssues = Array.isArray(data.issues) ? data.issues : [];
      collected.push(...pageIssues);

      const total = typeof data.paging?.total === 'number' ? data.paging.total : pageIssues.length;
      if (pageIssues.length < pageSize || collected.length >= total) {
        break;
      }
    }

    return collected.slice(0, maxIssues);
  } catch (err) {
    console.error(`Erro ao buscar issues do SonarQube para ${projectKey}:`, err.message);
    return [];
  }
}

function normalizeRepoPath(filePath) {
  return (filePath || '').replaceAll('\\', '/').replace(/^\.\//, '');
}

function parsePatchChangedLines(patch) {
  if (!patch || typeof patch !== 'string') return null;
  const changedLines = new Set();
  let currentNewLine = 0;
  let inHunk = false;

  for (const line of patch.split('\n')) {
    const hunkMatch = line.match(/^@@\s+-\d+(?:,\d+)?\s+\+(\d+)(?:,\d+)?\s+@@/);
    if (hunkMatch) {
      currentNewLine = parseInt(hunkMatch[1], 10);
      inHunk = true;
      continue;
    }
    if (!inHunk) continue;

    if (line.startsWith('+')) {
      changedLines.add(currentNewLine);
      currentNewLine += 1;
    } else if (line.startsWith('-')) {
      if (currentNewLine > 0) {
        changedLines.add(currentNewLine);
      }
    } else if (!line.startsWith('\\')) {
      currentNewLine += 1;
    }
  }

  return changedLines;
}

async function fetchPullRequestDiffScope(github, context) {
  const prNumber = context.payload?.pull_request?.number;
  if (!prNumber || !github?.rest?.pulls?.listFiles) {
    return null;
  }

  try {
    const files = await github.paginate(github.rest.pulls.listFiles, {
      ...context.repo,
      pull_number: prNumber,
      per_page: 100
    });

    const scopeMap = new Map();
    for (const file of files) {
      if (file.status === 'removed') continue;
      const filename = normalizeRepoPath(file.filename);
      scopeMap.set(filename, {
        added: file.status === 'added',
        changedLines: file.status === 'added' ? null : parsePatchChangedLines(file.patch)
      });
    }
    return scopeMap;
  } catch (err) {
    console.warn(`Não foi possível listar arquivos do PR #${prNumber} via API:`, err.message);
    return null;
  }
}

function rangeIntersectsLines(startLine, endLine, changedLines) {
  if (!changedLines || changedLines.size === 0) return false;
  const from = Math.max(1, Number(startLine) || 1);
  const to = Math.max(from, Number(endLine) || from);
  for (let line = from; line <= to; line += 1) {
    if (changedLines.has(line)) return true;
  }
  return false;
}

function collectIssueLocations(issue, defaultComponent, projKey) {
  const locations = [];
  const primaryPath = normalizeRepoPath(cleanComponentPath(defaultComponent, projKey));

  if (issue.textRange && typeof issue.textRange.startLine === 'number') {
    locations.push({
      path: primaryPath,
      startLine: issue.textRange.startLine,
      endLine: issue.textRange.endLine ?? issue.textRange.startLine
    });
  } else if (typeof issue.line === 'number') {
    locations.push({ path: primaryPath, startLine: issue.line, endLine: issue.line });
  }

  if (Array.isArray(issue.flows)) {
    for (const flow of issue.flows) {
      for (const loc of flow.locations || []) {
        if (!loc.textRange || typeof loc.textRange.startLine !== 'number') continue;
        const locPath = loc.component
          ? normalizeRepoPath(cleanComponentPath(loc.component, projKey))
          : primaryPath;
        locations.push({
          path: locPath,
          startLine: loc.textRange.startLine,
          endLine: loc.textRange.endLine ?? loc.textRange.startLine
        });
      }
    }
  }

  return locations;
}

function filterIssuesByPullRequestDiff(issues, projKey, prScope) {
  if (!Array.isArray(issues)) return [];
  return issues.filter(issue => {
    const primaryPath = normalizeRepoPath(cleanComponentPath(issue.component, projKey));
    const primaryScope = prScope.get(primaryPath);
    if (!primaryScope) {
      return false;
    }

    if (primaryScope.added || primaryScope.changedLines === null) {
      return true;
    }

    const locations = collectIssueLocations(issue, issue.component, projKey);
    if (locations.length === 0) {
      return true;
    }

    return locations.some(loc => {
      const targetScope = prScope.get(loc.path);
      if (!targetScope) return false;
      if (targetScope.added || targetScope.changedLines === null) return true;
      return rangeIntersectsLines(loc.startLine, loc.endLine, targetScope.changedLines);
    });
  });
}

function formatSeverityBadge(severity) {
  switch (severity) {
    case 'BLOCKER': return '⛔ Blocker';
    case 'CRITICAL': return '🔴 Critical';
    case 'MAJOR': return '🟠 Major';
    case 'MINOR': return '🟡 Minor';
    case 'INFO': return 'ℹ️ Info';
    default: return severity || 'N/A';
  }
}

function formatTypeBadge(type) {
  switch (type) {
    case 'BUG': return '🐛 Bug';
    case 'VULNERABILITY': return '🛡️ Vulnerabilidade';
    case 'CODE_SMELL': return '🧹 Code Smell';
    case 'SECURITY_HOTSPOT': return '🔒 Hotspot';
    default: return type || 'Issue';
  }
}

function cleanComponentPath(component, projectKey) {
  let clean = (component || '').replace(`${projectKey}:`, '');
  if (projectKey.includes('frontend') && !clean.startsWith('frontend/')) {
    clean = `frontend/${clean}`;
  } else if (projectKey.includes('backend') && !clean.startsWith('backend/')) {
    clean = `backend/${clean}`;
  }
  return clean;
}

module.exports = async function ({ github, context, core }) {
  const backendStatus = process.env.BACKEND_STATUS || 'unknown';
  const frontendStatus = process.env.FRONTEND_STATUS || 'unknown';
  const sonarHostUrl = process.env.SONAR_HOST_URL || '';
  const sonarToken = process.env.SONAR_TOKEN || '';
  const prHeadSha = context.payload?.pull_request?.head?.sha;
  const fullSha = prHeadSha || context.sha || '';
  const commitSha = fullSha ? fullSha.substring(0, 7) : 'N/A';
  const runId = context.runId;
  const repoUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}`;
  const runUrl = `${repoUrl}/actions/runs/${runId}`;

  // E2E status (preenchido apenas quando chamado do workflow e2e.yml)
  const e2eStatus = process.env.E2E_STATUS || '';
  const e2eModules = process.env.E2E_MODULES || '';
  const e2eRunUrl = process.env.E2E_RUN_URL || '';

  const baseDir = process.env.GITHUB_WORKSPACE || process.cwd();
  const backendSearchDirs = [
    path.join(baseDir, 'artifacts-backend'),
    path.join(baseDir, 'backend', 'target')
  ];
  const frontendSearchDirs = [
    path.join(baseDir, 'artifacts-frontend'),
    path.join(baseDir, 'frontend', 'coverage')
  ];

  const backendTests = parseSurefireReports(backendSearchDirs);
  const backendCov = parseJacocoCsv(backendSearchDirs);
  const frontendTests = parseVitestReport(frontendSearchDirs);
  const frontendCov = parseVitestCoverage(frontendSearchDirs);

  let [backendQG, frontendQG, backendIssues, frontendIssues, prDiffScope] = await Promise.all([
    fetchSonarQualityGate('alumigest-backend', sonarHostUrl, sonarToken),
    fetchSonarQualityGate('alumigest-frontend', sonarHostUrl, sonarToken),
    fetchSonarIssues('alumigest-backend', sonarHostUrl, sonarToken, 500),
    fetchSonarIssues('alumigest-frontend', sonarHostUrl, sonarToken, 500),
    fetchPullRequestDiffScope(github, context)
  ]);

  const isPrDiffScoped = prDiffScope !== null;

  // Em Pull Requests, filtra estritamente pelos arquivos e linhas alteradas no diff deste PR
  // para impedir vazamento de apontamentos de outros PRs no mesmo projeto SonarQube.
  const filterIssuesByExistingFiles = (issues, projKey) => {
    if (!issues || !Array.isArray(issues)) return [];
    return issues.filter(issue => {
      const fullPath = cleanComponentPath(issue.component, projKey);
      return fs.existsSync(path.join(baseDir, fullPath));
    });
  };

  if (isPrDiffScoped) {
    backendIssues = filterIssuesByPullRequestDiff(backendIssues, 'alumigest-backend', prDiffScope);
    frontendIssues = filterIssuesByPullRequestDiff(frontendIssues, 'alumigest-frontend', prDiffScope);
  } else {
    backendIssues = filterIssuesByExistingFiles(backendIssues, 'alumigest-backend');
    frontendIssues = filterIssuesByExistingFiles(frontendIssues, 'alumigest-frontend');
  }

  const backendQGFailed = backendQG && backendQG.status === 'ERROR';
  const frontendQGFailed = frontendQG && frontendQG.status === 'ERROR';
  const e2eFailed = e2eStatus === 'failure' || e2eStatus === 'cancelled';

  const allFailures = [...backendTests.failedTests, ...frontendTests.failedTests];
  const overallSuccess = backendStatus === 'success' && 
                         frontendStatus === 'success' && 
                         !e2eFailed &&
                         allFailures.length === 0 &&
                         !backendQGFailed &&
                         !frontendQGFailed;

  const statusBadge = overallSuccess 
    ? '### 🟢 Pipeline Aprovada com Sucesso' 
    : '### 🔴 Falhas Detectadas na Pipeline';

  let markdown = `## 🤖 AlumiGest CI — Relatório de Validação do PR\n\n`;
  markdown += `${statusBadge}\n\n`;
  markdown += `> Commit analisado: \`${commitSha}\` | [Ver Execução no GitHub Actions](${runUrl})\n\n`;

  markdown += `### 📋 Visão Consolidada\n\n`;
  markdown += `| Componente | Etapa | Status | Detalhes / Métricas |\n`;
  markdown += `| :--- | :--- | :---: | :--- |\n`;

  // Backend
  const bBuildStatus = backendStatus === 'success' ? '✅ Sucesso' : (backendStatus === 'failure' ? '❌ Falha' : '⚠️ Pendente');
  markdown += `| **Backend** (Spring Boot) | Build & Checkstyle | ${bBuildStatus} | Java 21 / Google Checks |\n`;

  if (backendTests.found) {
    const bFailCount = backendTests.failures + backendTests.errors;
    const bTestStatus = bFailCount === 0 ? `✅ ${backendTests.tests} passaram` : `❌ ${bFailCount} falha(s)`;
    const bTestDetails = `${backendTests.tests} total (0 erros, ${backendTests.skipped} ignorados)`;
    markdown += `| | Testes Automatizados | ${bTestStatus} | ${bTestDetails} |\n`;
  } else {
    markdown += `| | Testes Automatizados | ⚠️ Não executado | Relatórios não localizados |\n`;
  }

  if (backendCov) {
    markdown += `| | Cobertura (JaCoCo) | 📈 ${backendCov.linePct}% | Linhas: ${backendCov.linesCovered}/${backendCov.totalLines} (${backendCov.branchPct}% branches) |\n`;
  } else {
    markdown += `| | Cobertura (JaCoCo) | ℹ️ Indisponível | JaCoCo CSV não gerado |\n`;
  }

  if (sonarHostUrl) {
    const sonarBackendUrl = `${sonarHostUrl}/dashboard?id=alumigest-backend`;
    let qgStatus = '🔍 Concluído';
    if (backendQG) {
      qgStatus = backendQG.status === 'OK' ? '✅ Aprovado (OK)' : '❌ Reprovado (ERROR)';
    }
    markdown += `| | SonarQube Quality Gate | ${qgStatus} | [Acessar Dashboard Backend](${sonarBackendUrl}) |\n`;
  }

  // Frontend
  const fBuildStatus = frontendStatus === 'success' ? '✅ Sucesso' : (frontendStatus === 'failure' ? '❌ Falha' : '⚠️ Pendente');
  markdown += `| **Frontend** (React + Vite) | Linter (Oxlint) & Build | ${fBuildStatus} | TypeScript & Vite Build |\n`;

  if (frontendTests.found) {
    const fFailCount = frontendTests.failures + frontendTests.errors;
    const fTestStatus = fFailCount === 0 ? `✅ ${frontendTests.tests} passaram` : `❌ ${fFailCount} falha(s)`;
    markdown += `| | Testes Unitários (Vitest) | ${fTestStatus} | ${frontendTests.tests} testes executados |\n`;
  } else {
    markdown += `| | Testes Unitários (Vitest) | ⚠️ Não executado | Relatório Vitest não localizado |\n`;
  }

  if (frontendCov) {
    markdown += `| | Cobertura (Vitest) | 📈 ${frontendCov.linePct}% | Linhas: ${frontendCov.linesCovered}/${frontendCov.totalLines} (${frontendCov.branchPct}% branches) |\n`;
  } else {
    markdown += `| | Cobertura (Vitest) | ℹ️ Indisponível | Coverage summary não gerado |\n`;
  }

  if (sonarHostUrl) {
    const sonarFrontendUrl = `${sonarHostUrl}/dashboard?id=alumigest-frontend`;
    let qgStatus = '🔍 Concluído';
    if (frontendQG) {
      qgStatus = frontendQG.status === 'OK' ? '✅ Aprovado (OK)' : '❌ Reprovado (ERROR)';
    }
    markdown += `| | SonarQube Quality Gate | ${qgStatus} | [Acessar Dashboard Frontend](${sonarFrontendUrl}) |\n`;
  }

  if (allFailures.length > 0) {
    markdown += `\n### ❌ Falhas Encontradas (${allFailures.length})\n\n`;
    for (const f of allFailures) {
      markdown += `<details>\n`;
      markdown += `<summary><b>[${f.component}] ${f.name}</b></summary>\n\n`;
      markdown += `**Mensagem:** \`${f.message}\`\n\n`;
      if (f.details) {
        markdown += `\`\`\`\n${f.details}\n\`\`\`\n`;
      }
      markdown += `</details>\n\n`;
    }
  }

  const failedQGConditions = [];
  if (backendQG && backendQG.conditions) {
    for (const c of backendQG.conditions) {
      if (c.status === 'ERROR') {
        failedQGConditions.push({ component: 'Backend', ...c });
      }
    }
  }
  if (frontendQG && frontendQG.conditions) {
    for (const c of frontendQG.conditions) {
      if (c.status === 'ERROR') {
        failedQGConditions.push({ component: 'Frontend', ...c });
      }
    }
  }

  const hasSonarIssues = (backendIssues && backendIssues.length > 0) || (frontendIssues && frontendIssues.length > 0);

  if (failedQGConditions.length > 0 || hasSonarIssues) {
    markdown += `\n### 🚨 Apontamentos do SonarQube & Quality Gate\n\n`;

    if (failedQGConditions.length > 0) {
      markdown += `#### ⚠️ Condições Reprovadas no Quality Gate\n\n`;
      for (const c of failedQGConditions) {
        const op = c.comparator === 'GT' ? '>' : (c.comparator === 'LT' ? '<' : c.comparator);
        markdown += `- **[${c.component}]** Métrica: \`${c.metricKey}\` | Valor: **${c.actualValue}** (Limite: ${op} ${c.errorThreshold})\n`;
      }
      markdown += `\n`;
    }

    if (hasSonarIssues) {
      const scopeHint = isPrDiffScoped
        ? 'Os apontamentos abaixo foram filtrados estritamente pelos arquivos e linhas alteradas no diff deste PR.'
        : 'Os apontamentos abaixo foram detectados no código novo analisado.';
      markdown += `> 💡 **Guia Rápido de Correção:** ${scopeHint} Clique no arquivo para abrir a linha diretamente no GitHub.\n\n`;

      const renderIssueTable = (issues, compName, projKey) => {
        if (!issues || issues.length === 0) return '';
        let section = `#### ${compName === 'Backend' ? '☕' : '🖥️'} ${compName} (${issues.length} issue${issues.length > 1 ? 's' : ''})\n\n`;
        section += `| Severidade | Tipo | Arquivo & Linha | Regra | Descrição do Problema |\n`;
        section += `| :---: | :---: | :--- | :---: | :--- |\n`;

        for (const issue of issues) {
          const sev = formatSeverityBadge(issue.severity);
          const type = formatTypeBadge(issue.type);
          const fullPath = cleanComponentPath(issue.component, projKey);
          const fileName = path.basename(fullPath);
          const lineNum = issue.line || (issue.textRange ? issue.textRange.startLine : 1);

          let fileLink = `\`${fileName}:${lineNum}\``;
          if (repoUrl && fullSha) {
            fileLink = `[\`${fileName}:${lineNum}\`](${repoUrl}/blob/${fullSha}/${fullPath}#L${lineNum})`;
          }

          const escapedMsg = (issue.message || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
          section += `| ${sev} | ${type} | ${fileLink} | \`${issue.rule}\` | ${escapedMsg} |\n`;
        }
        section += `\n`;
        return section;
      };

      if (frontendIssues && frontendIssues.length > 0) {
        markdown += renderIssueTable(frontendIssues, 'Frontend', 'alumigest-frontend');
      }
      if (backendIssues && backendIssues.length > 0) {
        markdown += renderIssueTable(backendIssues, 'Backend', 'alumigest-backend');
      }
    }
  }

  // ==========================================
  // SEÇÃO E2E (quando disponível via merge_group)
  // ==========================================
  if (e2eStatus) {
    markdown += `\n### 🧪 Testes End-to-End (Cypress)\n\n`;

    const e2eIcon = e2eStatus === 'success' ? '✅' : (e2eStatus === 'failure' ? '❌' : '⚠️');
    const e2eLabel = e2eStatus === 'success' ? 'Todos os módulos passaram' : (e2eStatus === 'failure' ? 'Falhas detectadas' : 'Pendente');

    markdown += `| Módulo | Status |\n`;
    markdown += `| :--- | :---: |\n`;

    if (e2eModules) {
      // Formato esperado: "budgets:success,catalog:success,orders:failure,customers:success,part-sales:success"
      const moduleNames = {
        'budgets': 'Orçamentos',
        'catalog': 'Catálogo',
        'orders': 'Pedidos & Produção',
        'customers': 'Clientes (Hub 360°)',
        'part-sales': 'Venda Avulsa'
      };
      const modules = e2eModules.split(',').map(m => m.trim());
      for (const mod of modules) {
        const [key, status] = mod.split(':');
        const name = moduleNames[key] || key;
        const icon = status === 'success' ? '✅ Passou' : (status === 'failure' ? '❌ Falhou' : '⚠️ ' + (status || 'N/A'));
        markdown += `| ${name} | ${icon} |\n`;
      }
    } else {
      markdown += `| **Resultado Geral** | ${e2eIcon} ${e2eLabel} |\n`;
    }

    if (e2eRunUrl) {
      markdown += `\n> 🔗 [Ver execução E2E no GitHub Actions](${e2eRunUrl})\n`;
    }

    if (e2eStatus === 'failure') {
      markdown += `\n> ⚠️ **Screenshots e vídeos** de testes que falharam estão disponíveis como artifacts na execução do workflow E2E.\n`;
    }
  }

  markdown += `\n---\n`;
  markdown += `*Relatório gerado automaticamente pelo GitHub Actions em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}*\n`;
  markdown += `<!-- alumigest-ci-report -->\n`;

  // Post or update PR comment
  const issueNumber = context.issue ? context.issue.number : context.payload?.pull_request?.number;
  if (!issueNumber) {
    console.log('Nenhum issue_number ou pull_request.number detectado. Exibindo markdown no console:');
    console.log(markdown);
    return;
  }

  try {
    const { data: comments } = await github.rest.issues.listComments({
      ...context.repo,
      issue_number: issueNumber
    });

    const existingComment = comments.find(c => c.body && c.body.includes('<!-- alumigest-ci-report -->'));

    if (existingComment) {
      await github.rest.issues.updateComment({
        ...context.repo,
        comment_id: existingComment.id,
        body: markdown
      });
      console.log(`Comentário existente #${existingComment.id} atualizado com sucesso no PR #${issueNumber}.`);
    } else {
      await github.rest.issues.createComment({
        ...context.repo,
        issue_number: issueNumber,
        body: markdown
      });
      console.log(`Novo comentário de relatório criado com sucesso no PR #${issueNumber}.`);
    }
  } catch (err) {
    console.error('Erro ao postar comentário no PR:', err);
    if (core && core.setFailed) {
      core.setFailed(`Falha ao publicar relatório no PR: ${err.message}`);
    }
  }
};
