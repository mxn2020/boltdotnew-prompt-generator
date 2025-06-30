import type { PromptVersion, VersionChange, VersionComparison } from '../../types/version';

export class VersionDiffer {
  static compareVersions(from: PromptVersion, to: PromptVersion): VersionComparison {
    const changes: VersionChange[] = [];

    // Compare basic fields
    if (from.title !== to.title) {
      changes.push({
        type: 'modified',
        path: 'title',
        oldValue: from.title,
        newValue: to.title,
        description: `Title changed from "${from.title}" to "${to.title}"`,
      });
    }

    if (from.description !== to.description) {
      changes.push({
        type: 'modified',
        path: 'description',
        oldValue: from.description,
        newValue: to.description,
        description: 'Description updated',
      });
    }

    if (from.structure_type !== to.structure_type) {
      changes.push({
        type: 'modified',
        path: 'structure_type',
        oldValue: from.structure_type,
        newValue: to.structure_type,
        description: `Structure type changed from ${from.structure_type} to ${to.structure_type}`,
      });
    }

    if (from.category !== to.category) {
      changes.push({
        type: 'modified',
        path: 'category',
        oldValue: from.category,
        newValue: to.category,
        description: `Category changed from ${from.category} to ${to.category}`,
      });
    }

    if (from.complexity !== to.complexity) {
      changes.push({
        type: 'modified',
        path: 'complexity',
        oldValue: from.complexity,
        newValue: to.complexity,
        description: `Complexity changed from ${from.complexity} to ${to.complexity}`,
      });
    }

    // Compare tags
    const fromTags = new Set(from.tags);
    const toTags = new Set(to.tags);
    
    const addedTags = [...toTags].filter(tag => !fromTags.has(tag));
    const removedTags = [...fromTags].filter(tag => !toTags.has(tag));

    if (addedTags.length > 0) {
      changes.push({
        type: 'added',
        path: 'tags',
        newValue: addedTags,
        description: `Added tags: ${addedTags.join(', ')}`,
      });
    }

    if (removedTags.length > 0) {
      changes.push({
        type: 'removed',
        path: 'tags',
        oldValue: removedTags,
        description: `Removed tags: ${removedTags.join(', ')}`,
      });
    }

    // Compare content
    const contentChanges = this.compareContent(from.content, to.content);
    changes.push(...contentChanges);

    return {
      from,
      to,
      changes,
    };
  }

  private static compareContent(fromContent: any, toContent: any): VersionChange[] {
    const changes: VersionChange[] = [];

    // Compare segments
    if (fromContent.segments || toContent.segments) {
      const fromSegments = fromContent.segments || [];
      const toSegments = toContent.segments || [];
      
      const segmentChanges = this.compareArrays(
        fromSegments,
        toSegments,
        'segments',
        (segment) => segment.id,
        (from, to) => this.compareSegments(from, to)
      );
      changes.push(...segmentChanges);
    }

    // Compare sections
    if (fromContent.sections || toContent.sections) {
      const fromSections = fromContent.sections || [];
      const toSections = toContent.sections || [];
      
      const sectionChanges = this.compareArrays(
        fromSections,
        toSections,
        'sections',
        (section) => section.id,
        (from, to) => this.compareSections(from, to)
      );
      changes.push(...sectionChanges);
    }

    // Compare modules
    if (fromContent.modules || toContent.modules) {
      const fromModules = fromContent.modules || [];
      const toModules = toContent.modules || [];
      
      const moduleChanges = this.compareArrays(
        fromModules,
        toModules,
        'modules',
        (module) => module.id,
        (from, to) => this.compareModules(from, to)
      );
      changes.push(...moduleChanges);
    }

    // Compare blocks
    if (fromContent.blocks || toContent.blocks) {
      const fromBlocks = fromContent.blocks || [];
      const toBlocks = toContent.blocks || [];
      
      const blockChanges = this.compareArrays(
        fromBlocks,
        toBlocks,
        'blocks',
        (block) => block.id,
        (from, to) => this.compareBlocks(from, to)
      );
      changes.push(...blockChanges);
    }

    return changes;
  }

  private static compareArrays<T>(
    fromArray: T[],
    toArray: T[],
    arrayName: string,
    getId: (item: T) => string,
    compareItems: (from: T, to: T) => VersionChange[]
  ): VersionChange[] {
    const changes: VersionChange[] = [];
    
    const fromMap = new Map(fromArray.map(item => [getId(item), item]));
    const toMap = new Map(toArray.map(item => [getId(item), item]));

    // Find added items
    for (const [id, item] of toMap) {
      if (!fromMap.has(id)) {
        changes.push({
          type: 'added',
          path: `${arrayName}.${id}`,
          newValue: item,
          description: `Added ${arrayName.slice(0, -1)}: ${(item as any).title || id}`,
        });
      }
    }

    // Find removed items
    for (const [id, item] of fromMap) {
      if (!toMap.has(id)) {
        changes.push({
          type: 'removed',
          path: `${arrayName}.${id}`,
          oldValue: item,
          description: `Removed ${arrayName.slice(0, -1)}: ${(item as any).title || id}`,
        });
      }
    }

    // Find modified items
    for (const [id, fromItem] of fromMap) {
      const toItem = toMap.get(id);
      if (toItem) {
        const itemChanges = compareItems(fromItem, toItem);
        changes.push(...itemChanges.map(change => ({
          ...change,
          path: `${arrayName}.${id}.${change.path}`,
        })));
      }
    }

    return changes;
  }

  private static compareSegments(from: any, to: any): VersionChange[] {
    const changes: VersionChange[] = [];

    if (from.type !== to.type) {
      changes.push({
        type: 'modified',
        path: 'type',
        oldValue: from.type,
        newValue: to.type,
        description: `Segment type changed from ${from.type} to ${to.type}`,
      });
    }

    if (from.content !== to.content) {
      changes.push({
        type: 'modified',
        path: 'content',
        oldValue: from.content,
        newValue: to.content,
        description: 'Segment content updated',
      });
    }

    return changes;
  }

  private static compareSections(from: any, to: any): VersionChange[] {
    const changes: VersionChange[] = [];

    if (from.title !== to.title) {
      changes.push({
        type: 'modified',
        path: 'title',
        oldValue: from.title,
        newValue: to.title,
        description: `Section title changed from "${from.title}" to "${to.title}"`,
      });
    }

    if (from.description !== to.description) {
      changes.push({
        type: 'modified',
        path: 'description',
        oldValue: from.description,
        newValue: to.description,
        description: 'Section description updated',
      });
    }

    if (from.content !== to.content) {
      changes.push({
        type: 'modified',
        path: 'content',
        oldValue: from.content,
        newValue: to.content,
        description: 'Section content updated',
      });
    }

    return changes;
  }

  private static compareModules(from: any, to: any): VersionChange[] {
    const changes: VersionChange[] = [];

    if (from.title !== to.title) {
      changes.push({
        type: 'modified',
        path: 'title',
        oldValue: from.title,
        newValue: to.title,
        description: `Module title changed from "${from.title}" to "${to.title}"`,
      });
    }

    if (from.description !== to.description) {
      changes.push({
        type: 'modified',
        path: 'description',
        oldValue: from.description,
        newValue: to.description,
        description: 'Module description updated',
      });
    }

    if (from.content !== to.content) {
      changes.push({
        type: 'modified',
        path: 'content',
        oldValue: from.content,
        newValue: to.content,
        description: 'Module content updated',
      });
    }

    // Compare wrappers
    const fromWrappers = from.wrappers || [];
    const toWrappers = to.wrappers || [];
    
    // Check if arrays are different
    if (JSON.stringify(fromWrappers) !== JSON.stringify(toWrappers)) {
      changes.push({
        type: 'modified',
        path: 'wrappers',
        oldValue: fromWrappers,
        newValue: toWrappers,
        description: `Module wrappers changed from [${fromWrappers.join(', ') || 'none'}] to [${toWrappers.join(', ') || 'none'}]`,
      });
    }

    return changes;
  }

  private static compareBlocks(from: any, to: any): VersionChange[] {
    const changes: VersionChange[] = [];

    if (from.title !== to.title) {
      changes.push({
        type: 'modified',
        path: 'title',
        oldValue: from.title,
        newValue: to.title,
        description: `Block title changed from "${from.title}" to "${to.title}"`,
      });
    }

    if (from.description !== to.description) {
      changes.push({
        type: 'modified',
        path: 'description',
        oldValue: from.description,
        newValue: to.description,
        description: 'Block description updated',
      });
    }

    // Compare modules within blocks
    const moduleChanges = this.compareArrays(
      from.modules || [],
      to.modules || [],
      'modules',
      (module) => module.id,
      (fromModule, toModule) => this.compareModules(fromModule, toModule)
    );
    changes.push(...moduleChanges);

    return changes;
  }

  static generateChangelogSummary(changes: VersionChange[]): string {
    if (changes.length === 0) {
      return 'No changes detected';
    }

    const summary = [];
    const addedCount = changes.filter(c => c.type === 'added').length;
    const removedCount = changes.filter(c => c.type === 'removed').length;
    const modifiedCount = changes.filter(c => c.type === 'modified').length;

    if (addedCount > 0) {
      summary.push(`${addedCount} addition${addedCount > 1 ? 's' : ''}`);
    }
    if (removedCount > 0) {
      summary.push(`${removedCount} removal${removedCount > 1 ? 's' : ''}`);
    }
    if (modifiedCount > 0) {
      summary.push(`${modifiedCount} modification${modifiedCount > 1 ? 's' : ''}`);
    }

    return summary.join(', ');
  }
}