/**
 * README Builder
 * Generates comprehensive README documentation from ProjectSpec using GPT
 */

import { ProjectSpec } from '../types/project';
import { callGpt } from './openaiClient';

/**
 * Build a comprehensive README from project specification
 * @param project The project specification
 * @returns Generated README markdown string
 */
export async function buildReadme(project: ProjectSpec): Promise<string> {
  const prompt = buildPrompt(project);

  try {
    const readme = await callGpt(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 8000,
    });

    return readme;
  } catch (error) {
    throw new Error(
      `Failed to generate README: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Build the GPT prompt from project specification
 * @param project The project specification
 * @returns Formatted prompt for GPT
 */
function buildPrompt(project: ProjectSpec): string {
  const stackInfo = formatStackInfo(project);
  const featuresInfo = formatFeaturesInfo(project);
  const entitiesInfo = formatEntitiesInfo(project);
  const apiInfo = formatApiInfo(project);
  const testsInfo = formatTestsInfo(project);

  return `You are a technical documentation expert. Generate a comprehensive, professional README.md based on the following project specification.

PROJECT SPECIFICATION:
=====================

PROJECT NAME: ${project.meta.projectName}
SUMMARY: ${project.meta.summary}

STACK INFORMATION:
${stackInfo}

FEATURES:
${featuresInfo}

ENTITIES & DATA MODEL:
${entitiesInfo}

API CONFIGURATION:
${apiInfo}

TESTS:
${testsInfo}

DEPLOYMENT: ${project.deployment.platform}
CI/CD: ${project.deployment.ci.enabled ? project.deployment.ci.provider : 'Not configured'}

REQUIREMENTS:
Generate a README.md with the following sections in this exact order:

1. **Project Title** - Use the project name as the main title
2. **Table of Contents** - Auto-generate based on sections
3. **Overview** - Use the summary provided
4. **Tech Stack** - List frontend, backend, and overall architecture
5. **Features** - List all features in a clear format
6. **Getting Started** 
   - Prerequisites
   - Installation steps
   - Configuration (environment variables if needed)
   - Running the project
7. **Project Structure** - Describe the folder organization
8. **Data Model** - Describe entities and relationships (if applicable)
9. **API Documentation** - List endpoints (if applicable)
10. **Testing** - Describe the testing strategy
11. **Deployment** - Explain deployment process
12. **Contributing** - Basic contribution guidelines
13. **License** - Default to MIT

GUIDELINES:
- Use clear, professional language
- Use code blocks with proper syntax highlighting
- Use markdown tables where appropriate
- Be specific to this project's configuration
- Don't add fictional content; only use what's provided
- Mark suggested features with "⭐ Suggested:" prefix
- Use emoji appropriately for visual clarity
- Include commands that can be copy-pasted
- Make it beginner-friendly but technically accurate

Generate only the README content, no additional text.`;
}

/**
 * Format stack information for prompt
 */
function formatStackInfo(project: ProjectSpec): string {
  const lines: string[] = [];

  lines.push(`Project Type: ${project.stack.type}`);
  lines.push(`Architecture: ${project.stack.architecture}`);

  if (
    project.stack.type === 'frontend' ||
    project.stack.type === 'fullstack'
  ) {
    lines.push(
      `Frontend Framework: ${project.stack.frontend.framework || 'Not specified'}`
    );
    lines.push(
      `Frontend Language: ${project.stack.frontend.language || 'Not specified'}`
    );
    if (project.stack.frontend.libraries.length > 0) {
      lines.push(`Frontend Libraries: ${project.stack.frontend.libraries.join(', ')}`);
    }
  }

  if (
    project.stack.type === 'backend' ||
    project.stack.type === 'fullstack'
  ) {
    lines.push(
      `Backend Framework: ${project.stack.backend.framework || 'Not specified'}`
    );
    lines.push(
      `Backend Language: ${project.stack.backend.language || 'Not specified'}`
    );
    if (project.stack.backend.libraries.length > 0) {
      lines.push(`Backend Libraries: ${project.stack.backend.libraries.join(', ')}`);
    }
  }

  return lines.map((l) => `  ${l}`).join('\n');
}

/**
 * Format features information for prompt
 */
function formatFeaturesInfo(project: ProjectSpec): string {
  if (project.features.length === 0) {
    return '  No features specified.';
  }

  return project.features
    .map((f) => `  - ${f.name}: ${f.description}`)
    .join('\n');
}

/**
 * Format entities information for prompt
 */
function formatEntitiesInfo(project: ProjectSpec): string {
  if (project.entities.length === 0) {
    return '  No entities specified.';
  }

  const entityDescriptions = project.entities.map((entity) => {
    const fieldsList = entity.fields
      .map((f) => `    - ${f.name} (${f.type}${f.required ? ', required' : ''})`)
      .join('\n');

    const relationsList =
      entity.relations.length > 0
        ? entity.relations
            .map((r) => `    - ${r.type} with ${r.target}`)
            .join('\n')
        : '';

    return `  **${entity.name}**: ${entity.description}
Fields:
${fieldsList}
${relationsList ? `Relations:\n${relationsList}` : ''}`;
  });

  return entityDescriptions.join('\n\n');
}

/**
 * Format API information for prompt
 */
function formatApiInfo(project: ProjectSpec): string {
  if (project.api.type === 'none') {
    return '  No API specified.';
  }

  let info = `API Type: ${project.api.type}\n`;
  info += `Documentation: ${project.api.documentation}\n`;

  if (project.api.endpoints.length > 0) {
    info += '\nEndpoints:\n';
    project.api.endpoints.forEach((ep) => {
      info += `  - ${ep.methods.join(',')} ${ep.path} - ${ep.description}\n`;
    });
  }

  return info;
}

/**
 * Format tests information for prompt
 */
function formatTestsInfo(project: ProjectSpec): string {
  const testTypes: string[] = [];

  if (project.tests.unit) testTypes.push('Unit Tests');
  if (project.tests.integration) testTypes.push('Integration Tests');
  if (project.tests.e2e) testTypes.push('End-to-End Tests');
  if (project.tests.manualChecklists) testTypes.push('Manual Checklists');

  if (testTypes.length === 0) {
    return '  No testing strategy specified.';
  }

  return `  ${testTypes.join(', ')} with ${project.tests.frameworks.join(', ')}`;
}
