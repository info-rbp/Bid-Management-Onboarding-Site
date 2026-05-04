
"use client";

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, UploadCloud } from 'lucide-react';

interface GrantsProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isLocked: boolean;
}

const GrantProjectCard = ({ project, index, onChange, onRemove, isLocked }: any) => {
  const handleChange = (field: string, value: any) => {
    onChange(index, { ...project, [field]: value });
  };

  return (
    <Card className="border-none shadow-sm rounded-3xl bg-slate-50">
      <CardHeader className="border-b flex flex-row items-center justify-between">
        <CardTitle>Grant Project Idea #{index + 1}</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => onRemove(index)} disabled={isLocked}><Trash2 className="w-4 h-4 text-destructive" /></Button>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 col-span-2"><Label>Project name or idea</Label><Input value={project.name || ''} onChange={(e) => handleChange('name', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2 col-span-2"><Label>What is the purpose of the funding?</Label><Textarea value={project.purpose || ''} onChange={(e) => handleChange('purpose', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Why is this project needed?</Label><Textarea value={project.need || ''} onChange={(e) => handleChange('need', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Who will benefit from this project?</Label><Textarea value={project.beneficiaries || ''} onChange={(e) => handleChange('beneficiaries', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Project location</Label><Input value={project.location || ''} onChange={(e) => handleChange('location', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Estimated start date</Label><Input type="date" value={project.startDate || ''} onChange={(e) => handleChange('startDate', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Estimated end date</Label><Input type="date" value={project.endDate || ''} onChange={(e) => handleChange('endDate', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Estimated total cost</Label><Input type="number" value={project.totalCost || ''} onChange={(e) => handleChange('totalCost', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Funding amount requested</Label><Input type="number" value={project.fundingAmount || ''} onChange={(e) => handleChange('fundingAmount', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Business contribution</Label><Input value={project.contribution || ''} onChange={(e) => handleChange('contribution', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2 col-span-2"><Label>Expected outcomes</Label><Textarea value={project.outcomes || ''} onChange={(e) => handleChange('outcomes', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2 col-span-2"><Label>Evidence supporting the need</Label><Textarea value={project.evidence || ''} onChange={(e) => handleChange('evidence', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Known grant programs or deadlines</Label><Input value={project.knownPrograms || ''} onChange={(e) => handleChange('knownPrograms', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2"><Label>Partners or collaborators</Label><Input value={project.partners || ''} onChange={(e) => handleChange('partners', e.target.value)} disabled={isLocked} /></div>
        <div className="space-y-2 col-span-2"><Label>Sustainability after grant funding</Label><Textarea value={project.sustainability || ''} onChange={(e) => handleChange('sustainability', e.target.value)} disabled={isLocked} /></div>
      </CardContent>
    </Card>
  );
};

export function Grants({ data, onChange, isLocked }: GrantsProps) {
  const projects = data.projects || [];

  const handleAddProject = () => {
    onChange('projects', [...projects, {}]);
  };

  const handleRemoveProject = (index: number) => {
    const updatedProjects = projects.filter((_: any, i: number) => i !== index);
    onChange('projects', updatedProjects);
  };

  const handleProjectChange = (index: number, projectData: any) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = projectData;
    onChange('projects', updatedProjects);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-headline font-bold text-slate-900">Grants</h2>
        <p className="text-slate-500 text-lg">Capture your grant project ideas, funding needs, budget, outcomes, and evidence.</p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-white">
        <CardHeader className="border-b"><CardTitle>Grant Funding Interest</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-4">
            <div><Label>Are you interested in pursuing grant funding?</Label>
                <RadioGroup value={data.interest} onValueChange={(v) => onChange('interest', v)} className="mt-2">
                    <div className="flex items-center gap-4"><RadioGroupItem value="yes" id="interest-yes" /><Label htmlFor="interest-yes">Yes, definitely</Label></div>
                    <div className="flex items-center gap-4"><RadioGroupItem value="maybe" id="interest-maybe" /><Label htmlFor="interest-maybe">Maybe, I'm open to it</Label></div>
                    <div className="flex items-center gap-4"><RadioGroupItem value="no" id="interest-no" /><Label htmlFor="interest-no">No, not right now</Label></div>
                </RadioGroup>
            </div>
        </CardContent>
      </Card>

      {(data.interest === 'yes' || data.interest === 'maybe') && (
        <div className="space-y-6">
            <div className="space-y-4 text-center pt-6 border-t">
                <h3 className="text-2xl font-bold">Grant Project Ideas</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">Let's outline your potential grant projects. Add as many as you have in mind. This helps us find the best funding opportunities for you.</p>
            </div>
            {projects.map((p: any, i: number) => (
                <GrantProjectCard 
                    key={i} 
                    project={p} 
                    index={i} 
                    onChange={handleProjectChange} 
                    onRemove={handleRemoveProject} 
                    isLocked={isLocked} 
                />
            ))}
            <div className="text-center">
                <Button onClick={handleAddProject} disabled={isLocked}><Plus className="w-4 h-4 mr-2"/>Add Another Project Idea</Button>
            </div>
        </div>
      )}
    </div>
  );
}
