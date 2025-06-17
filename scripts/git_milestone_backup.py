#!/usr/bin/env python3
"""
Git里程碑自动备份脚本
配合Git MCP服务实现自动化的关键里程碑备份
"""

import json
import subprocess
import sys
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class GitMilestoneBackup:
    def __init__(self, config_path: str = "config/git_mcp_config.json"):
        """初始化备份管理器"""
        self.config_path = Path(config_path)
        self.project_root = Path.cwd()
        self.config = self._load_config()
        
    def _load_config(self) -> Dict:
        """加载配置文件"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ 配置文件未找到: {self.config_path}")
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"❌ 配置文件格式错误: {e}")
            sys.exit(1)
    
    def _run_git_command(self, command: List[str]) -> tuple[bool, str]:
        """执行Git命令"""
        try:
            result = subprocess.run(
                ['git'] + command,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            return result.returncode == 0, result.stdout.strip() or result.stderr.strip()
        except Exception as e:
            return False, str(e)
    
    def get_current_status(self) -> Dict:
        """获取当前Git状态"""
        status = {}
        
        # 获取当前分支
        success, branch = self._run_git_command(['branch', '--show-current'])
        status['current_branch'] = branch if success else 'unknown'
        
        # 获取最新提交
        success, commit = self._run_git_command(['rev-parse', 'HEAD'])
        status['latest_commit'] = commit[:8] if success else 'unknown'
        
        # 获取工作区状态
        success, working_status = self._run_git_command(['status', '--porcelain'])
        status['has_changes'] = bool(working_status) if success else True
        
        # 获取未推送的提交
        success, unpushed = self._run_git_command(['log', '@{u}..HEAD', '--oneline'])
        status['unpushed_commits'] = len(unpushed.split('\n')) if success and unpushed else 0
        
        return status
    
    def create_milestone_backup(self, milestone_key: str, force: bool = False) -> bool:
        """创建里程碑备份"""
        if milestone_key not in self.config['gitAutomation']['milestones']:
            print(f"❌ 未找到里程碑配置: {milestone_key}")
            return False
        
        milestone = self.config['gitAutomation']['milestones'][milestone_key]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        print(f"🎯 开始创建里程碑备份: {milestone['description']}")
        
        # 1. 检查工作区状态
        status = self.get_current_status()
        if status['has_changes'] and not force:
            print("⚠️  工作区有未提交的更改，请先提交或使用 --force 参数")
            return False
        
        # 2. 确保在正确的分支上
        target_branch = milestone.get('branch', f"milestone-{milestone_key}")
        if status['current_branch'] != target_branch:
            print(f"🔄 切换到目标分支: {target_branch}")
            success, msg = self._run_git_command(['checkout', '-b', target_branch])
            if not success and 'already exists' in msg:
                success, msg = self._run_git_command(['checkout', target_branch])
            
            if not success:
                print(f"❌ 分支切换失败: {msg}")
                return False
        
        # 3. 添加所有更改（如果有）
        if status['has_changes']:
            print("📝 添加所有更改到暂存区")
            success, msg = self._run_git_command(['add', '.'])
            if not success:
                print(f"❌ 添加文件失败: {msg}")
                return False
        
        # 4. 创建里程碑提交
        commit_message = milestone['commitMessage']
        print("💾 创建里程碑提交")
        success, msg = self._run_git_command(['commit', '-m', commit_message])
        if not success and 'nothing to commit' not in msg:
            print(f"❌ 提交失败: {msg}")
            return False
        
        # 5. 创建标签
        if 'tags' in milestone:
            for tag in milestone['tags']:
                tag_name = f"{tag}-{timestamp}" if not tag.startswith('v') else tag
                print(f"🏷️  创建标签: {tag_name}")
                success, msg = self._run_git_command(['tag', '-a', tag_name, '-m', milestone['description']])
                if not success:
                    print(f"⚠️  标签创建失败: {msg}")
        
        # 6. 推送到远程（如果启用）
        if self.config['gitAutomation']['autoBackup']['remoteBackup']:
            print("☁️  推送到远程仓库")
            success, msg = self._run_git_command(['push', 'origin', target_branch])
            if not success:
                print(f"⚠️  推送分支失败: {msg}")
            
            # 推送标签
            success, msg = self._run_git_command(['push', 'origin', '--tags'])
            if not success:
                print(f"⚠️  推送标签失败: {msg}")
        
        # 7. 创建自动备份分支
        backup_branch = self.config['gitAutomation']['autoBackup']['backupBranch'].format(
            timestamp=timestamp
        )
        print(f"💾 创建自动备份分支: {backup_branch}")
        success, msg = self._run_git_command(['checkout', '-b', backup_branch])
        if success:
            if self.config['gitAutomation']['autoBackup']['remoteBackup']:
                self._run_git_command(['push', 'origin', backup_branch])
        
        # 8. 返回原分支
        self._run_git_command(['checkout', target_branch])
        
        print(f"✅ 里程碑备份完成: {milestone_key}")
        print(f"📊 备份信息:")
        print(f"   - 分支: {target_branch}")
        print(f"   - 备份分支: {backup_branch}")
        print(f"   - 标签: {', '.join(milestone.get('tags', []))}")
        print(f"   - 时间戳: {timestamp}")
        
        return True
    
    def list_milestones(self) -> None:
        """列出所有可用的里程碑"""
        print("📋 可用的里程碑:")
        for key, milestone in self.config['gitAutomation']['milestones'].items():
            print(f"   🎯 {key}: {milestone['description']}")
    
    def cleanup_old_backups(self) -> None:
        """清理旧的备份分支"""
        cleanup_config = self.config['gitAutomation']['autoBackup']['cleanupOldBackups']
        if not cleanup_config['enabled']:
            print("🧹 自动清理已禁用")
            return
        
        print("🧹 开始清理旧的备份分支...")
        
        # 获取所有备份分支
        success, branches = self._run_git_command(['branch', '-r', '--list', 'origin/backup/*'])
        if not success:
            print("❌ 获取备份分支列表失败")
            return
        
        backup_branches = [b.strip().replace('origin/', '') for b in branches.split('\n') if b.strip()]
        
        # 按时间排序，保留最新的几个
        keep_count = cleanup_config['keepLast']
        if len(backup_branches) > keep_count:
            to_delete = backup_branches[:-keep_count]
            for branch in to_delete:
                print(f"🗑️  删除旧备份分支: {branch}")
                self._run_git_command(['push', 'origin', '--delete', branch])
        
        print(f"✅ 清理完成，保留了最新的 {min(len(backup_branches), keep_count)} 个备份")

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Git里程碑自动备份工具")
    parser.add_argument('action', choices=['backup', 'list', 'cleanup', 'status'], 
                       help='执行的操作')
    parser.add_argument('--milestone', '-m', help='里程碑键名（用于backup操作）')
    parser.add_argument('--force', '-f', action='store_true', 
                       help='强制执行，忽略工作区更改')
    parser.add_argument('--config', '-c', default='config/git_mcp_config.json',
                       help='配置文件路径')
    
    args = parser.parse_args()
    
    backup_manager = GitMilestoneBackup(args.config)
    
    if args.action == 'backup':
        if not args.milestone:
            print("❌ 请指定里程碑键名 (--milestone)")
            backup_manager.list_milestones()
            sys.exit(1)
        
        success = backup_manager.create_milestone_backup(args.milestone, args.force)
        sys.exit(0 if success else 1)
    
    elif args.action == 'list':
        backup_manager.list_milestones()
    
    elif args.action == 'cleanup':
        backup_manager.cleanup_old_backups()
    
    elif args.action == 'status':
        status = backup_manager.get_current_status()
        print("📊 当前Git状态:")
        print(f"   - 当前分支: {status['current_branch']}")
        print(f"   - 最新提交: {status['latest_commit']}")
        print(f"   - 工作区状态: {'有更改' if status['has_changes'] else '干净'}")
        print(f"   - 未推送提交: {status['unpushed_commits']}")

if __name__ == "__main__":
    main()
