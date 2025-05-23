import chalk from 'chalk';

export interface CliFormattingOptions {
  colors?: boolean;
  border?: boolean;
  indent?: number;
}

// Format date in YYYY-MM-DD format
export const formatDate = (date: any): string => {
  if (!date) return 'N/A';
  
  // Handle Firestore timestamps
  if (date && typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
    date = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
  }
  
  // Handle Date objects
  if (date instanceof Date) {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  }
  
  // Try to convert string to date if needed
  try {
    return formatDate(new Date(date));
  } catch (e) {
    return String(date);
  }
}

// Create a section header
export const header = (text: string): string => {
  return '\n' + chalk.bold.blue('╭' + '─'.repeat(text.length + 10) + '╮') + 
         '\n' + chalk.bold.blue('│') + ' ' + chalk.bold.white(text) + ' '.repeat(8) + chalk.bold.blue('│') + 
         '\n' + chalk.bold.blue('╰' + '─'.repeat(text.length + 10) + '╯');
};

// Format key-value pair with alignment
export const keyValue = (key: string, value: string | number | boolean, indent: number = 0): string => {
  const keyStr = ' '.repeat(indent) + chalk.cyan(key + ':');
  return `${keyStr} ${chalk.white(String(value))}`;
};

// Create a divider line
export const divider = (): string => {
  return chalk.gray('─'.repeat(50));
};

// Format status with appropriate color
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': chalk.green('● Active'),
    'completed': chalk.green('✓ Completed'),
    'pending': chalk.yellow('○ Pending'),
    'cancelled': chalk.red('✗ Cancelled')
  };
  
  return statusMap[status.toLowerCase()] || chalk.gray(status);
};
