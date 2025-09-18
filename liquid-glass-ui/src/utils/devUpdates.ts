// Utility functions for posting development updates via MCP

export interface DevUpdateData {
    feature: string
    description: string
    code_highlights?: string[]
    files_created?: string[]
    files_modified?: string[]
    status?: 'completed' | 'in_progress' | 'failed'
    kiro_notes?: string
    next_steps?: string[]
}

export const postDevUpdate = async (updateData: DevUpdateData): Promise<boolean> => {
    try {
        const response = await fetch('http://localhost:5001/dev/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                feature: updateData.feature,
                description: updateData.description,
                code_highlights: updateData.code_highlights || [],
                files_created: updateData.files_created || [],
                files_modified: updateData.files_modified || [],
                status: updateData.status || 'completed',
                kiro_notes: updateData.kiro_notes || '',
                next_steps: updateData.next_steps || []
            })
        })

        const result = await response.json()
        return result.success === true
    } catch (error) {
        console.error('Failed to post dev update:', error)
        return false
    }
}

export const clearDevUpdates = async (): Promise<boolean> => {
    try {
        const response = await fetch('http://localhost:5001/dev/updates', {
            method: 'DELETE'
        })
        const result = await response.json()
        return result.success === true
    } catch (error) {
        console.error('Failed to clear dev updates:', error)
        return false
    }
}